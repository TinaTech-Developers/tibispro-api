import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = verifyToken(token);

    const body = await req.json();
    const {
      organizationName,
      currency,
      country,
      industry,
      phone,
      address,
      city,
      logoUrl,
    } = body;

    if (!organizationName || !currency || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // prevent multiple orgs
    if (user.organizationId) {
      return NextResponse.json(
        { error: "User already has an organization" },
        { status: 400 },
      );
    }

    // 🧠 TRIAL SYSTEM (14 DAYS)
    const now = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(now.getDate() + 14);

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        currency,
        country,
        industry,
        phone,
        address,
        city,
        logoUrl,

        plan: "FREE",
        status: "ACTIVE",
        isSetupComplete: true,
        trialEndsAt,

        // connect user
        users: {
          connect: { id: user.id },
        },

        // create subscription record
        subscriptions: {
          create: {
            plan: "PRO",
            status: "TRIAL",
            startDate: now,
            trialEndsAt,
          },
        },
      },
      include: {
        users: true,
        subscriptions: true,
      },
    });

    // optional: update user FK (safe redundancy)
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id },
    });

    return NextResponse.json({
      message: "Organization created successfully",
      organization,
      trialEndsAt,
      trialDays: 14,
    });
  } catch (err: any) {
    console.error("ORG SETUP ERROR:", err);

    return NextResponse.json(
      {
        error: "Failed to setup organization",
        details: err?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}
