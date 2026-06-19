import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const { customerId, items } = await req.json();

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and items are required" },
        { status: 400 },
      );
    }

    let total = 0;

    // 🔥 STEP 1: validate + calculate total safely
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // 🔥 STEP 2: create invoice first
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        customerId,
        organizationId: decoded.orgId,
        total,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId ?? null,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 🔥 STEP 3: STOCK UPDATE (CRITICAL ERP LOGIC)
    for (const item of items) {
      if (!item.productId) continue; // skip custom items

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          organizationId: decoded.orgId,
          type: "OUT",
          quantity: item.quantity,
          reason: `invoice ${invoice.invoiceNumber}`,
        },
      });
    }

    return NextResponse.json({ invoice });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: decoded.orgId,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true, // 👈 THIS IS WHAT YOU ARE MISSING
            payments: true,
            items: true,
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invoices });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}
