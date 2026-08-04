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
    console.log("PASSWORD RAW:", JSON.stringify(password));
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

    console.log("DATABASE HASH:", user.passwordHash);

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
              plan: organization.plan,
              isSetupComplete: organization.isSetupComplete,
              trialEndsAt: organization.trialEndsAt,
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
