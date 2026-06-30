import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";

type Context = {
  params: { id: string };
};

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { orgId } = requireOrg(req);

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const { orgId } = requireOrg(req);

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE ERROR:", err);

    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { orgId } = requireOrg(req);
    const body = await req.json();

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PATCH ERROR:", err);

    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}
