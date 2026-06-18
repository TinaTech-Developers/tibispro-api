import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const organization = await prisma.organization.findUnique({
      where: {
        id: decoded.orgId,
      },
    });

    return NextResponse.json({ organization });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to load organization",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const data = await req.json();

    const organization = await prisma.organization.update({
      where: {
        id: decoded.orgId,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        industry: data.industry,
        currency: data.currency,
        address: data.address,
        city: data.city,
        country: data.country,
        logoUrl: data.logoUrl,
      },
    });

    return NextResponse.json({ organization });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const data = await req.json();

    const organization = await prisma.organization.update({
      where: {
        id: decoded.orgId,
      },
      data: {
        ...data,
        isSetupComplete: true,
      },
    });

    return NextResponse.json({
      message: "Setup completed",
      organization,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to complete setup" },
      { status: 500 },
    );
  }
}
