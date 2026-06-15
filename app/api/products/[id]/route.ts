import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const product = await prisma.product.findFirst({
      where: {
        id: (await params).id,
        organizationId: decoded.orgId,
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const data = await req.json();

    const updated = await prisma.product.update({
      where: {
        id: (await params).id,
      },
      data,
    });

    return NextResponse.json({ product: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    verifyToken(token!);

    await prisma.product.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
