import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const {
      organizationName,
      currency,
      country,
      industry,
      phone,
      address,
      city,
    } = await req.json();

    if (!organizationName || !currency || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Create organization
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        currency,
        country,
        industry,
        phone,
        address,
        city,
        isSetupComplete: true,
      },
    });

    // 2. Attach to user
    await prisma.user.update({
      where: {
        id: decoded.userId,
      },
      data: {
        organizationId: organization.id,
      },
    });

    return NextResponse.json({
      message: "Organization created",
      organization,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Failed to setup organization",
        details: err.message,
      },
      { status: 500 },
    );
  }
}
