import { QuotationStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

/* ================= GET ================= */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const { id } = await params;

    const quotation = await prisma.quotation.findFirst({
      where: {
        id,
        organizationId: decoded.orgId,
      },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json({ quotation });
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load quotation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    verifyToken(token);

    const { status } = await req.json();
    const { id } = await params;

    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status: status as QuotationStatus },
    });

    return NextResponse.json({ quotation });
  } catch (err) {
    console.error("PATCH ERROR:", err);

    return NextResponse.json(
      { error: "Failed to update quotation" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    verifyToken(token);

    const { id } = await params;

    await prisma.quotation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Quotation deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);

    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 500 },
    );
  }
}
