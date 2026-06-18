import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { orgId } = getAuth(req);

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        plan: true,
        trialEndsAt: true,
        status: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    const now = new Date();

    // trial logic (Option A)
    const trialActive = org.trialEndsAt && new Date(org.trialEndsAt) > now;

    // subscription = plan-based only (NO table)
    const isActive = trialActive || org.plan === "PRO";

    return NextResponse.json({
      isActive,
      trialEndsAt: org.trialEndsAt,
      hasActiveSubscription: org.plan === "PRO",
      plan: org.plan,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 },
    );
  }
}
