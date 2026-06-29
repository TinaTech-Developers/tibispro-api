import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const { orgId } = getAuth(req);

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, phone, address, city, country, industry } =
      await req.json();

    const organization = await prisma.organization.update({
      where: {
        id: orgId,
      },
      data: {
        name,
        email,
        phone,
        address,
        city,
        country,
        industry,
      },
    });

    return NextResponse.json(organization);
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
