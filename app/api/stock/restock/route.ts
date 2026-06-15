import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const { productId, quantity } = await req.json();

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId,
        organizationId: decoded.orgId,
        type: "IN",
        quantity,
        reason: "restock",
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to restock product" },
      { status: 500 },
    );
  }
}
