import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getAuth } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const { orgId } = getAuth(req);

    const { title, amount } = await req.json();

    if (!title || !amount) {
      return NextResponse.json(
        { error: "Title and amount are required" },
        { status: 400 },
      );
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount,
        organizationId: orgId,
      },
    });

    return NextResponse.json({ expense });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { orgId } = getAuth(req);
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ expenses });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 },
    );
  }
}
