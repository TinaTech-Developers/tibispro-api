import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true, // ✅ FIX: removed subscriptions
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    if (user.role === "SUPER_ADMIN") {
      const token = signToken({
        userId: user.id,
        role: user.role,
        orgId: null, // important
      });

      return NextResponse.json({
        token,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        // 🚨 super admin does NOT need SaaS logic
        hasOrganization: false,
        subscriptionStatus: null,
        needsSetup: false,
      });
    }

    const organization = user.organization;

    // 🧠 TRIAL LOGIC (based on your schema)
    const isTrialActive =
      !!organization?.trialEndsAt &&
      new Date(organization.trialEndsAt) > new Date();

    const needsSetup = !organization?.isSetupComplete;

    // 💡 Subscription logic now depends on PLAN ONLY
    const needsSubscription =
      organization && !isTrialActive && organization.plan !== "PRO";

    const token = signToken({
      userId: user.id,
      role: user.role,
      orgId: user.organizationId,
    });
    return NextResponse.json({
      token,

      hasOrganization: !!organization,

      subscriptionStatus: {
        active: isTrialActive || organization?.plan === "PRO",
        needsPayment: needsSubscription,
      },

      needsSetup,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization:
          organization ?
            {
              id: organization.id,
              name: organization.name,
              isSetupComplete: organization.isSetupComplete,
              plan: organization.plan,
              trialEndsAt: organization.trialEndsAt,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      {
        error: "Server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
