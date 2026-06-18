import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const body = await req.json();

    const { customerId, items, validUntil, quotationNumber } = body;

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and items are required" },
        { status: 400 },
      );
    }

    let total = 0;

    const formattedItems = items.map((item: any) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);

      const itemTotal = qty * price;
      total += itemTotal;

      return {
        name: item.name,
        qty,
        price,
        productId: item.productId || null,
      };
    });

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: quotationNumber || `QUO-${Date.now()}`,

        customerId,
        organizationId: decoded.orgId,

        status: "DRAFT",
        total,

        validUntil: validUntil ? new Date(validUntil) : null,

        items: {
          create: formattedItems,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return NextResponse.json({ quotation });
  } catch (err: any) {
    console.error("QUOTATION ERROR:", err);

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

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

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
    console.error("FETCH ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 },
    );
  }
}
