import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { orgId } = getAuth(req);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 📊 BASIC COUNTS
    const [customers, products, invoices] = await Promise.all([
      prisma.customer.count({ where: { organizationId: orgId } }),
      prisma.product.count({ where: { organizationId: orgId } }),
      prisma.invoice.findMany({ where: { organizationId: orgId } }),
    ]);

    // 🧾 INVOICE BREAKDOWN
    const paidInvoices = invoices.filter((i) => i.status === "PAID").length;

    const pendingInvoices = invoices.filter(
      (i) => i.status === "PENDING",
    ).length;

    const invoiceConversionRate =
      invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0;

    // 💰 ALL PAYMENTS (REVENUE SOURCE)
    const payments = await prisma.payment.findMany({
      where: {
        organizationId: orgId,
        status: "PAID",
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // 📅 THIS MONTH REVENUE
    const thisMonthPayments = payments.filter(
      (p) => new Date(p.createdAt) >= startOfMonth,
    );

    const thisMonthRevenue = thisMonthPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    // 📅 LAST MONTH REVENUE
    const lastMonthPayments = payments.filter((p) => {
      const date = new Date(p.createdAt);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    });

    const lastMonthRevenue = lastMonthPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    // 📈 MONTHLY REVENUE TREND (LAST 6 MONTHS)
    const monthlyRevenue: { month: string; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthPayments = payments.filter((p) => {
        const date = new Date(p.createdAt);
        return date >= start && date <= end;
      });

      const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      monthlyRevenue.push({
        month: start.toLocaleString("default", { month: "short" }),
        total,
      });
    }

    return NextResponse.json({
      customers,
      products,
      invoices: {
        total: invoices.length,
        paid: paidInvoices,
        pending: pendingInvoices,
        conversionRate: invoiceConversionRate,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
      },
      monthlyRevenue,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
