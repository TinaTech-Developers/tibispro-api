import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth, requireOrg } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = requireOrg(req);

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 },
      );
    }
    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (err.message === "NO_ORGANIZATION") {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = requireOrg(req);

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 },
      );
    }

    const { id } = await params;

    await prisma.customer.deleteMany({
      where: {
        id,
        organizationId: orgId,
      },
    });

    return NextResponse.json({ message: "Customer deleted" });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (err.message === "NO_ORGANIZATION") {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = requireOrg(req);

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 },
      );
    }
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.customer.updateMany({
      where: {
        id,
        organizationId: orgId,
      },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (err.message === "NO_ORGANIZATION") {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
