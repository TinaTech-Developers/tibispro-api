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

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    if (!decoded?.orgId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const orgId = decoded.orgId;

    // ====================================
    // REVENUE
    // ====================================
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

    // ====================================
    // EXPENSES
    // ====================================
    const expensesAgg = await prisma.expense.aggregate({
      where: {
        organizationId: orgId,
      },
      _sum: {
        amount: true,
      },
    });

    const expenses = expensesAgg._sum.amount ?? 0;

    const profit = revenue - expenses;

    // ====================================
    // COUNTS
    // ====================================
    const [invoicesCount, customersCount, productsCount, pendingInvoices] =
      await Promise.all([
        prisma.invoice.count({
          where: {
            organizationId: orgId,
          },
        }),

        prisma.customer.count({
          where: {
            organizationId: orgId,
          },
        }),

        prisma.product.count({
          where: {
            organizationId: orgId,
          },
        }),

        prisma.invoice.count({
          where: {
            organizationId: orgId,
            status: "PENDING",
          },
        }),
      ]);

    // ====================================
    // TOP PRODUCTS
    // ====================================
    const topProducts = await prisma.invoiceItem.groupBy({
      by: ["name"],

      where: {
        invoice: {
          organizationId: orgId,
        },

        name: {
          not: null,
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

    // ====================================
    // MONTHLY GROWTH
    // ====================================
    const monthlyRevenue = await prisma.$queryRaw<
      { month: string; total: number }[]
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month,
        SUM(amount)::float AS total
      FROM "Payment"
      WHERE "organizationId" = ${orgId}
      AND status = 'PAID'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `;

    // ====================================
    // THIS MONTH VS LAST MONTH
    // ====================================
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthRevenue = await prisma.payment.aggregate({
      where: {
        organizationId: orgId,
        status: "PAID",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        organizationId: orgId,
        status: "PAID",
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentRevenue = thisMonthRevenue._sum.amount ?? 0;

    const previousRevenue = lastMonthRevenue._sum.amount ?? 0;

    const growthPercent =
      previousRevenue === 0 ?
        currentRevenue > 0 ?
          100
        : 0
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // ====================================
    // TOP PRODUCT
    // ====================================
    const bestProduct = topProducts[0];

    // ====================================
    // RESPONSE
    // ====================================
    return NextResponse.json({
      stats: {
        revenue,
        expenses,
        profit,
        invoices: invoicesCount,
        customers: customersCount,
        products: productsCount,
      },

      insights: {
        growthPercent: Number(growthPercent.toFixed(1)),

        pendingInvoices,

        topProduct: bestProduct?.name ?? "No sales yet",
      },

      topProducts: topProducts.map((item) => ({
        name: item.name ?? "Unknown",
        sales: item._sum.quantity ?? 0,
      })),

      monthlyGrowth: monthlyRevenue.map((item) => ({
        month: item.month,
        value: item.total,
      })),
    });
  } catch (err) {
    console.log("ANALYTICS ERROR:", err);

    return NextResponse.json(
      {
        error: "Failed to load analytics",
      },
      {
        status: 500,
      },
    );
  }
}
