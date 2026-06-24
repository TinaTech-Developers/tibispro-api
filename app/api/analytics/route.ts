import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);

    const orgId = decoded.orgId;

    if (!orgId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ================================
    // 1. REVENUE (Payments)
    // ================================
    const revenueAgg = await prisma.payment.aggregate({
      where: {
        organizationId: orgId,
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    });

    const revenue = revenueAgg._sum.amount ?? 0;

    // ================================
    // 2. EXPENSES
    // ================================
    const expenseAgg = await prisma.expense.aggregate({
      where: {
        organizationId: orgId,
      },
      _sum: {
        amount: true,
      },
    });

    const expenses = expenseAgg._sum.amount ?? 0;

    // ================================
    // 3. INVOICES
    // ================================
    const invoices = await prisma.invoice.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: {
        _all: true,
      },
    });

    // ================================
    // 4. CUSTOMERS
    // ================================
    const customersCount = await prisma.customer.count({
      where: { organizationId: orgId },
    });

    // ================================
    // 5. PRODUCTS COUNT
    // ================================
    const productsCount = await prisma.product.count({
      where: { organizationId: orgId },
    });

    // ================================
    // 6. TOP PRODUCTS (by invoice items)
    // ================================
    const topProducts = await prisma.invoiceItem.groupBy({
      by: ["name"],
      where: {
        invoice: {
          organizationId: orgId,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // ================================
    // 7. MONTHLY REVENUE GROWTH
    // ================================
    const monthlyRevenue = await prisma.$queryRaw<
      { month: string; total: number }[]
    >`
      SELECT
        TO_CHAR("createdAt", 'Mon') AS month,
        SUM(amount)::float AS total
      FROM "Payment"
      WHERE "organizationId" = ${orgId}
        AND status = 'PAID'
      GROUP BY month, DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC;
    `;

    // ================================
    // RESPONSE
    // ================================
    return NextResponse.json({
      stats: {
        revenue,
        expenses,
        profit: revenue - expenses,
        invoices: invoices.reduce((acc, i) => acc + i._count._all, 0),
        customers: customersCount,
        products: productsCount,
      },

      invoiceBreakdown: invoices,

      topProducts: topProducts.map((p) => ({
        name: p.name ?? "Unknown",
        sales: p._sum.quantity ?? 0,
      })),

      monthlyGrowth: monthlyRevenue,
    });
  } catch (err) {
    console.log("ANALYTICS ERROR:", err);

    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
