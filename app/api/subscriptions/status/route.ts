import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { orgId } = getAuth(req);

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        subscriptions: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    const now = new Date();

    const trialActive = org.trialEndsAt && new Date(org.trialEndsAt) > now;

    const activeSubscription = org.subscriptions.find(
      (s) => s.status === "ACTIVE",
    );

    const isActive = Boolean(trialActive || activeSubscription);

    return NextResponse.json({
      isActive,
      trialEndsAt: org.trialEndsAt,
      hasActiveSubscription: !!activeSubscription,
      plan: org.plan,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 },
    );
  }
}
