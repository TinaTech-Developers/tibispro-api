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

    const payment = await prisma.payment.findFirst({
      where: {
        id: (await params).id,
        organizationId: decoded.orgId,
      },
      include: {
        invoice: true,
      },
    });

    return NextResponse.json({ payment });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch payment" },
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

    const payment = await prisma.payment.update({
      where: {
        id: (await params).id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({ payment });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update payment" },
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

    await prisma.payment.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ message: "Payment deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 },
    );
  }
}
