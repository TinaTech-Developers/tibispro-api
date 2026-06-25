import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { orgId } = getAuth(req);

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 },
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ organization });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to load organization" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { orgId } = getAuth(req);

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 },
      );
    }

    const data = await req.json();

    const organization = await prisma.organization.update({
      where: { id: orgId },
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
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = getAuth(req);

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 },
      );
    }

    const data = await req.json();

    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...data,
        isSetupComplete: true,
      },
    });

    return NextResponse.json({
      message: "Setup completed",
      organization,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to complete setup" },
      { status: 500 },
    );
  }
}
