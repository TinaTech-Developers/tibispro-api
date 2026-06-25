import { getAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { orgId } = getAuth(req);

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 },
      );
    }

    const customers = await prisma.customer.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ customers });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch customers" },
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

    const { name, email, phone, address } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        organizationId: orgId,
      },
    });

    return NextResponse.json({ customer });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
