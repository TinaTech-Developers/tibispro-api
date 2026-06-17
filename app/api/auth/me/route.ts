import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { userId, orgId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👤 Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organizationId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🏢 Get organization (if exists)
    let organization = null;

    if (orgId) {
      organization = await prisma.organization.findUnique({
        where: { id: orgId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          industry: true,
          currency: true,
          country: true,
          city: true,
          logoUrl: true,
          plan: true,
          status: true,
          isSetupComplete: true,
          trialEndsAt: true,
        },
      });
    }

    return NextResponse.json({
      user,
      organization,
    });
  } catch (err: any) {
    console.error("ME API ERROR:", err);

    return NextResponse.json(
      {
        error: "Failed to load user profile",
        details: err?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}
