import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = verifyToken(token);
    const { quotationId } = await req.json();

    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 },
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        customerId: quotation.customerId,
        organizationId: quotation.organizationId,
        status: "PENDING",
        total: quotation.total,

        items: {
          create: quotation.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            total: i.quantity * i.price,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}
