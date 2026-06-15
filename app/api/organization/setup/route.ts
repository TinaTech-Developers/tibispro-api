import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

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

        user: {
          connect: {
            id: decoded.userId,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Organization created",
      organization,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to setup organization" },
      { status: 500 },
    );
  }
}
