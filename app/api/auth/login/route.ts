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
        organization: true,
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

    const token = signToken({
      userId: user.id,
      orgId: user.organization?.id ?? null,
    });

    return NextResponse.json({
      token,
      needsOrgSetup: !user.organization,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,

        organization:
          user.organization ?
            {
              id: user.organization.id,
              name: user.organization.name,
              isSetupComplete: user.organization.isSetupComplete,
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
