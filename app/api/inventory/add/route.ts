import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";

type AuthPayload = JwtPayload & {
  organizationId: string;
};
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as AuthPayload;
    const { productId, type, quantity, reason } = await req.json();

    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        organizationId: decoded.organizationId,
        type,
        quantity,
        reason,
      },
    });

    // update stock
    const multiplier = type === "IN" ? 1 : -1;

    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: multiplier * Number(quantity),
        },
      },
    });

    return NextResponse.json({ movement });
  } catch (err) {
    console.log("STOCK MOVE ERROR:", err);

    return NextResponse.json(
      { error: "Failed stock movement" },
      { status: 500 },
    );
  }
}
