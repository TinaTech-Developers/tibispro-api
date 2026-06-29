import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getAuth } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);

    const body = await req.json();

    const {
      organizationName,
      email,
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    trialEndsAt.setTime(Date.now() + 1 * 24 * 60 * 60 * 1000);

    console.log("TRIAL ENDS:", trialEndsAt);

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        email,
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
      },
      include: {
        users: true,
      },
    });
    console.log("CREATED ORG:", organization);
    console.log("SAVED TRIAL:", organization.trialEndsAt);

    // optional: update user FK (safe redundancy)
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id },
    });

    return NextResponse.json({
      message: "Organization created successfully",

      routeState: {
        needsSetup: false,
        needsSubscription: false,
        isTrialActive: true,
      },

      organization,
      trialEndsAt,
      trialDays: 14,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to setup organization",
        details: err?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}
