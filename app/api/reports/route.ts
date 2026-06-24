import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // =====================
    // AUTH
    // =====================
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user?.userId || !user?.orgId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // =====================
    // RANGE
    // =====================
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";

    const now = new Date();
    const startDate = new Date();

    if (range === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (range === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (range === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // =====================
    // DATA
    // =====================
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: user.orgId,
        createdAt: {
          gte: startDate,
        },
      },
    });

    const customers = await prisma.customer.count({
      where: {
        organizationId: user.orgId,
      },
    });

    // =====================
    // CALCULATIONS
    // =====================
    let revenue = 0;
    let expenses = 0;
    let invoicesPaid = 0;
    let invoicesPending = 0;

    for (const inv of invoices) {
      if (inv.status === "PAID") {
        revenue += inv.total;
        invoicesPaid++;
      }

      if (inv.status === "PENDING") {
        invoicesPending++;
      }

      // safe fallback (since you DON'T have cost field yet)
      expenses += 0;
    }

    const profit = revenue - expenses;

    // =====================
    // MONTHLY TREND
    // =====================
    const grouped: Record<string, number> = {};

    for (const inv of invoices) {
      if (inv.status !== "PAID") continue;

      const month = new Date(inv.createdAt).toLocaleString("default", {
        month: "short",
      });

      grouped[month] = (grouped[month] || 0) + inv.total;
    }

    const monthlyTrend = Object.entries(grouped).map(([month, value]) => ({
      month,
      revenue: value,
    }));

    // =====================
    // RESPONSE
    // =====================
    return NextResponse.json({
      revenue,
      expenses,
      profit,
      invoicesPaid,
      invoicesPending,
      customers,
      monthlyTrend,
    });
  } catch (err) {
    console.log("REPORT API ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
