import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = email?.trim().toLowerCase();

    console.log("LOGIN ATTEMPT");
    console.log("EMAIL:", cleanEmail);
    console.log("PASSWORD LENGTH:", password?.length);

    if (!cleanEmail || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        {
          status: 400,
        },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
      include: {
        organization: true,
      },
    });

    console.log("USER FOUND:", user?.email);

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
        },
        {
          status: 401,
        },
      );
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    console.log("PASSWORD MATCH:", validPassword);

    if (!validPassword) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
        },
        {
          status: 401,
        },
      );
    }

    // SUPER ADMIN BYPASS
    if (user.role === "SUPER_ADMIN") {
      const token = signToken({
        userId: user.id,
        role: user.role,
        orgId: null,
      });

      return NextResponse.json({
        token,

        hasOrganization: false,

        subscriptionStatus: {
          active: true,
          needsPayment: false,
        },

        needsSetup: false,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    const organization = user.organization;

    // Free trial check
    const isTrialActive =
      !!organization?.trialEndsAt &&
      new Date(organization.trialEndsAt) > new Date();

    // Paid subscription check
    const isSubscriptionActive =
      !!organization?.subscriptionEndsAt &&
      new Date(organization.subscriptionEndsAt) > new Date();

    const needsSetup = !organization?.isSetupComplete;

    const needsSubscription =
      !!organization && !isTrialActive && !isSubscriptionActive;

    const token = signToken({
      userId: user.id,
      role: user.role,
      orgId: user.organizationId,
    });

    return NextResponse.json({
      token,

      hasOrganization: !!organization,

      subscriptionStatus: {
        active: isTrialActive || isSubscriptionActive,

        needsPayment: needsSubscription,

        expiresAt: organization?.subscriptionEndsAt ?? null,
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

              plan: organization.plan,

              isSetupComplete: organization.isSetupComplete,

              trialEndsAt: organization.trialEndsAt,

              subscriptionEndsAt: organization.subscriptionEndsAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}
