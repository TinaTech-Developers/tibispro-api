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

    const decoded: any = verifyToken(token);

    console.log("JWT:", decoded);

    const organizationId = decoded.organizationId || decoded.orgId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization not found in token" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const { productId, type, quantity, reason } = body;

    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const qty = Number(quantity);

    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (type === "OUT" && product.stock < qty) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          productId,
          organizationId,
          type,
          quantity: qty,
          reason: reason || "",
        },
      });

      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          stock: {
            increment: type === "IN" ? qty : -qty,
          },
        },
      });
    });

    const updatedProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({
      success: true,
      stock: updatedProduct?.stock,
    });
  } catch (error) {
    console.log("STOCK MOVE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed stock movement",
      },
      {
        status: 500,
      },
    );
  }
}
