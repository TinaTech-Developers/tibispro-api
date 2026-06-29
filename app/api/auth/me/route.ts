import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { userId, orgId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: true, // 👈 IMPORTANT (relation)
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user,
      organization: user.organization,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, orgId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { name, email, businessName, phone, address, city, country } = body;

    // Update user
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
      },
    });

    // Update organization
    if (orgId) {
      await prisma.organization.update({
        where: {
          id: orgId,
        },
        data: {
          name: businessName,
          phone,
          address,
          city,
          country,
        },
      });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Failed to update profile",
      },
      {
        status: 500,
      },
    );
  }
}
