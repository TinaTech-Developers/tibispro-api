import { QuotationStatus } from "@prisma/client";
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

    const quotation = await prisma.quotation.findFirst({
      where: {
        id: (await params).id,
        organizationId: decoded.orgId,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json({ quotation });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
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
    verifyToken(token!);

    const { status } = await req.json();

    const quotation = await prisma.quotation.update({
      where: {
        id: (await params).id,
      },
      data: {
        status: status as QuotationStatus,
      },
    });

    return NextResponse.json({ quotation });
  } catch (err) {
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
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    verifyToken(token!);

    await prisma.quotation.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ message: "Quotation deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 500 },
    );
  }
}
