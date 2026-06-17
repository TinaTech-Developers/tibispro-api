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
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const organization = user.organization;

    const subscription = organization?.subscriptions?.[0] ?? null;

    const isTrialActive =
      subscription?.status === "TRIAL" &&
      organization?.trialEndsAt &&
      new Date(organization.trialEndsAt) > new Date();

    const needsSetup = !organization?.isSetupComplete;

    const needsSubscription =
      organization && !isTrialActive && subscription?.status !== "ACTIVE";

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const hasOrganization = !!user.organization;

    const token = signToken({
      userId: user.id,
      orgId: user.organization?.id ?? null,
    });

    return NextResponse.json({
      token,

      hasOrganization: !!organization,

      routeState: {
        needsSetup,
        needsSubscription,
        isTrialActive,
      },

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
