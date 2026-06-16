import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = verifyToken(token);

    const {
      organizationName,
      currency,
      country,
      industry,
      phone,
      address,
      city,
      logoUrl,
    } = await req.json();

    if (!organizationName || !currency || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 🔥 Create organization AND attach user in ONE step (BEST PRACTICE)
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        currency,
        country,
        industry,
        phone,
        address,
        city,
        logoUrl,
        isSetupComplete: true,

        user: {
          connect: {
            id: decoded.userId,
          },
        },
      },
    });

    console.log("TOKEN HEADER:", auth);
    console.log("DECODED:", decoded);
    console.log("BODY:", req.json());
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
