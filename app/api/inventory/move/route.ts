import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const decoded = verifyToken(token) as any;

    if (!decoded?.organizationId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { productId, type, quantity, reason } = await req.json();

    if (!productId || !type || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const organizationId = decoded.organizationId; // 🔥 force extraction

    console.log("ORG ID:", organizationId); // debug

    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        organizationId, // ✅ MUST be value
        type,
        quantity: Number(quantity),
        reason: reason || "",
      },
    });

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
