import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

/* ================= GET PRODUCT ================= */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = verifyToken(token);

    const { id } = await context.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId: decoded.orgId,
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.log("PRODUCT GET ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

/* ================= UPDATE PRODUCT ================= */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = verifyToken(token);

    const { id } = await context.params;
    const body = await req.json();

    const { name, price, cost, stock, type } = body;

    const updatedProduct = await prisma.product.update({
      where: {
        id,
        organizationId: decoded.orgId,
      },
      data: {
        name,
        price,
        cost,
        stock,
        type,
      },
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.log("PRODUCT UPDATE ERROR:", err);

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

/* ================= DELETE PRODUCT ================= */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = verifyToken(token);

    const { id } = await context.params;

    await prisma.product.delete({
      where: {
        id,
        organizationId: decoded.orgId,
      },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.log("PRODUCT DELETE ERROR:", err);

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
