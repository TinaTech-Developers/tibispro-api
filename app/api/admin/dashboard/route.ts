import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // =====================
    // AUTH
    // =====================

    const auth = req.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const token = auth.split(" ")[1];

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        },
      );
    }

    // =====================
    // KPI DATA
    // =====================

    const totalOrganizations = await prisma.organization.count();

    const totalPayments = await prisma.subscriptionPayment.count();

    const pendingPayments = await prisma.subscriptionPayment.count({
      where: {
        status: "PENDING",
      },
    });

    const revenueResult = await prisma.subscriptionPayment.aggregate({
      where: {
        status: "PAID",
      },

      _sum: {
        amount: true,
      },
    });

    const revenue = revenueResult._sum.amount || 0;

    // =====================
    // REVENUE TREND
    // =====================

    const payments = await prisma.subscriptionPayment.findMany({
      where: {
        status: "PAID",
      },

      select: {
        amount: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    const revenueMap: any = {};

    payments.forEach((payment) => {
      const month = payment.createdAt.toLocaleString("default", {
        month: "short",
      });

      revenueMap[month] = (revenueMap[month] || 0) + payment.amount;
    });

    const revenueTrend = Object.keys(revenueMap).map((month) => ({
      month,

      revenue: revenueMap[month],
    }));

    // =====================
    // ORGANIZATION GROWTH
    // =====================

    const organizations = await prisma.organization.findMany({
      select: {
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    const orgMap: any = {};

    organizations.forEach((org) => {
      const month = org.createdAt.toLocaleString("default", {
        month: "short",
      });

      orgMap[month] = (orgMap[month] || 0) + 1;
    });

    const organizationGrowth = Object.keys(orgMap).map((month) => ({
      month,

      organizations: orgMap[month],
    }));

    // =====================
    // RECENT ACTIVITY
    // =====================

    const recentOrganizations = await prisma.organization.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 3,

      select: {
        name: true,
        createdAt: true,
      },
    });

    const recentPayments = await prisma.subscriptionPayment.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 3,

      select: {
        status: true,
        provider: true,
        createdAt: true,
      },
    });

    const activity = [
      ...recentOrganizations.map((org) => ({
        message: `New organization registered: ${org.name}`,

        createdAt: org.createdAt,
      })),

      ...recentPayments.map((payment) => ({
        message: `${payment.provider} payment ${payment.status.toLowerCase()}`,

        createdAt: payment.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // =====================
    // QUICK STATS
    // =====================

    const activeUsers = await prisma.user.count();

    const proSubscriptions = await prisma.organization.count({
      where: {
        plan: "PRO",
      },
    });

    const trials = await prisma.organization.count({
      where: {
        trialEndsAt: {
          not: null,
        },
      },
    });

    return NextResponse.json({
      success: true,

      kpi: {
        revenue,

        payments: totalPayments,

        pending: pendingPayments,

        organizations: totalOrganizations,
      },

      revenueTrend,

      organizationGrowth,

      activity,

      systemHealth: {
        api: "Healthy",

        database: "Healthy",

        payments: pendingPayments > 10 ? "Delayed" : "Healthy",
      },

      quickStats: {
        activeUsers,

        subscriptions: proSubscriptions,

        trials,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error", error);

    return NextResponse.json(
      {
        message: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}
