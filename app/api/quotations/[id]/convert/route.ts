import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { InvoiceStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    // 1. Get quotation
    const quotation = await prisma.quotation.findFirst({
      where: {
        id: (await params).id,
        organizationId: decoded.orgId,
      },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 },
      );
    }

    // 2. Optional safety check
    if (quotation.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Quotation must be ACCEPTED before converting" },
        { status: 400 },
      );
    }

    // 3. Create invoice items from quotation items
    const invoiceItems = quotation.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    }));

    // 4. Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        customerId: quotation.customerId,
        organizationId: decoded.orgId,
        total: quotation.total,
        status: InvoiceStatus.PENDING,
        items: {
          create: invoiceItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      message: "Quotation converted to invoice",
      invoice,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to convert quotation" },
      { status: 500 },
    );
  }
}
