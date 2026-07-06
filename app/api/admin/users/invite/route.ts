// /app/api/admin/users/invite/route.ts

import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { email, organizationId, role } = await req.json();

    if (!email || !organizationId) {
      return NextResponse.json(
        { error: "Email and organizationId are required." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 400 },
      );
    }

    // Temporary password
    const temporaryPassword = Math.random().toString(36).slice(-10);

    // Hash it
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        passwordHash,
        organizationId,
        role:
          role && Object.values(Role).includes(role as Role) ?
            (role as Role)
          : Role.STAFF,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User invited successfully.",
      temporaryPassword, // Remove this once you implement email invitations.
      user,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Invite failed.",
      },
      {
        status: 500,
      },
    );
  }
}
