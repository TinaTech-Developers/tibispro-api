import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { orgId } = requireOrg(req);

    const { title, amount, category, notes } = await req.json();

    if (!title || amount === undefined || !category) {
      return NextResponse.json(
        { error: "Title, amount and category are required." },
        { status: 400 },
      );
    }

    const expense = await prisma.expense.create({
      data: {
        expenseNumber: `EXP-${Date.now()}`,
        title,
        category,
        notes,
        amount: Number(amount),
        organizationId: orgId,
      },
    });

    return NextResponse.json({ expense });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Failed to create expense",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { orgId } = requireOrg(req);

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ expenses });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Failed to fetch expenses",
      },
      { status: 500 },
    );
  }
}
