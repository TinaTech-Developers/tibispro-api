import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // ==========================
    // AUTH
    // ==========================

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

    // ==========================
    // BASIC PLATFORM STATS
    // ==========================

    const totalOrganizations = await prisma.organization.count();

    const activeOrganizations = await prisma.organization.count({
      where: {
        status: "ACTIVE",
      },
    });

    const totalUsers = await prisma.user.count();

    const totalCustomers = await prisma.customer.count({
      where: {
        deletedAt: null,
      },
    });

    const totalProducts = await prisma.product.count();

    const totalInvoices = await prisma.invoice.count({
      where: {
        deletedAt: null,
      },
    });

    // ==========================
    // PLAN DISTRIBUTION
    // ==========================

    const plans = await prisma.organization.groupBy({
      by: ["plan"],

      _count: {
        plan: true,
      },
    });

    const planChart = plans.map((item) => ({
      name: item.plan,

      value: item._count.plan,
    }));

    // ==========================
    // ORGANIZATION GROWTH
    // ==========================

    const organizations = await prisma.organization.findMany({
      select: {
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    const growthMap: any = {};

    organizations.forEach((org) => {
      const month = org.createdAt.toLocaleString("default", {
        month: "short",
      });

      growthMap[month] = (growthMap[month] || 0) + 1;
    });

    const organizationGrowth = Object.keys(growthMap).map((month) => ({
      month,

      organizations: growthMap[month],
    }));

    // ==========================
    // SUBSCRIPTION ANALYTICS
    // ==========================

    const subscriptionRevenue = await prisma.subscriptionPayment.aggregate({
      where: {
        status: "PAID",
      },

      _sum: {
        amount: true,
      },
    });

    const paidPlans = await prisma.organization.count({
      where: {
        plan: "PRO",
      },
    });

    const trialPlans = await prisma.organization.count({
      where: {
        plan: "FREE",
        trialEndsAt: {
          not: null,
        },
      },
    });

    // ==========================
    // USER GROWTH
    // ==========================

    const users = await prisma.user.findMany({
      select: {
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    const userMap: any = {};

    users.forEach((user) => {
      const month = user.createdAt.toLocaleString("default", {
        month: "short",
      });

      userMap[month] = (userMap[month] || 0) + 1;
    });

    const userGrowth = Object.keys(userMap).map((month) => ({
      month,

      users: userMap[month],
    }));

    return NextResponse.json({
      success: true,

      stats: {
        totalOrganizations,

        activeOrganizations,

        totalUsers,

        totalCustomers,

        totalProducts,

        totalInvoices,

        paidPlans,

        trialPlans,

        subscriptionRevenue: subscriptionRevenue._sum.amount || 0,
      },

      planChart,

      organizationGrowth,

      userGrowth,
    });
  } catch (error) {
    console.error(error);

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
