import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getAuth } from "@/lib/auth";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = getAuth(req);
    const { id } = await params;
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    return NextResponse.json({ expense });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = getAuth(req);
    const { id } = await params;
    const token = req.headers.get("authorization")?.split(" ")[1];
    verifyToken(token!);

    await prisma.expense.delete({
      where: { id, organizationId: orgId },
    });

    return NextResponse.json({ message: "Expense deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 },
    );
  }
}
