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

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: (await params).id,
        organizationId: decoded.orgId,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true, // 👈 ADD THIS
          },
        },
      },
    });
    return NextResponse.json({ invoice });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
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

    const invoice = await prisma.invoice.update({
      where: {
        id: (await params).id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({ invoice });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update invoice" },
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

    await prisma.invoice.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ message: "Invoice deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}

















