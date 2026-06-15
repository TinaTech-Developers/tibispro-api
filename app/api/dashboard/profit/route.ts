import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getAuth } from "@/lib/auth";
export async function GET(req: Request) {
  try {
    const { orgId } = getAuth(req);

    // 💰 REVENUE (from payments)
    const payments = await prisma.payment.findMany({
      where: {
        organizationId: orgId,
        status: "PAID",
      },
    });

    const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // 💸 EXPENSES
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: orgId,
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 📊 PROFIT
    const profit = revenue - totalExpenses;

    return NextResponse.json({
      revenue,
      expenses: totalExpenses,
      profit,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to calculate profit" },
      { status: 500 },
    );
  }
}
