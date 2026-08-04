import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    console.log("LOGIN ATTEMPT");
    console.log("EMAIL:", email);
    console.log("PASSWORD LENGTH:", password?.length);

    if (!email || !password) {
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
          equals: email,
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

    // SUPER ADMIN LOGIN
    if (user.role === "SUPER_ADMIN") {
      const token = signToken({
        userId: user.id,
        role: user.role,
        orgId: null,
      });

      return NextResponse.json({
        token,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        hasOrganization: false,
        subscriptionStatus: null,
        needsSetup: false,
      });
    }

    const organization = user.organization;

    const isTrialActive =
      !!organization?.trialEndsAt &&
      new Date(organization.trialEndsAt) > new Date();

    const needsSetup = !organization?.isSetupComplete;

    const needsSubscription =
      !!organization && !isTrialActive && organization.plan !== "PRO";

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

      {
        status: 500,
      },
    );
  }
}
