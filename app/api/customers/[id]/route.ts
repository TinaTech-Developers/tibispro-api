import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";

/* ================= GET CUSTOMER ================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = requireOrg(req);
    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        invoices: true,
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
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}

/* ================= UPDATE CUSTOMER ================= */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = requireOrg(req);
    const { id } = await params;
    const body = await req.json();

    // ensure customer belongs to org
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

    const updated = await prisma.customer.update({
      where: {
        id: customer.id,
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
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

/* ================= DELETE CUSTOMER (FIXED) ================= */
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    console.log("DELETE HIT");

    const { orgId } = requireOrg(req);
    console.log("ORG ID:", orgId);

    const { id } = await params;
    console.log("CUSTOMER ID:", id);

    const result = await prisma.customer.deleteMany({
      where: {
        id,
        organizationId: orgId,
      },
    });

    console.log("DELETE RESULT:", result);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.log("🔥 DELETE ERROR FULL:", err); // <-- IMPORTANT

    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}