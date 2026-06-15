import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const { customerId, items, validUntil } = await req.json();

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and items are required" },
        { status: 400 },
      );
    }

    let total = 0;

    const formattedItems = items.map((item: any) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
      };
    });

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QUO-${Date.now()}`,
        customerId,
        organizationId: decoded.orgId,
        total,
        validUntil: validUntil ? new Date(validUntil) : null,
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ quotation });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const quotations = await prisma.quotation.findMany({
      where: {
        organizationId: decoded.orgId,
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ quotations });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 },
    );
  }
}
