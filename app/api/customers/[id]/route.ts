import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { orgId } = requireOrg(req);
    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        organizationId: orgId,
        deletedAt: null,
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
    console.error(err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const { orgId } = requireOrg(req);
    const { id } = await params;

    // 1. Check customer exists
    const customer = await prisma.customer.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // 2. Delete dependent data FIRST

    // delete invoice items + payments via invoices
    const invoices = await prisma.invoice.findMany({
      where: { customerId: id },
      select: { id: true },
    });

    for (const invoice of invoices) {
      await prisma.payment.deleteMany({
        where: { invoiceId: invoice.id },
      });

      await prisma.invoice.delete({
        where: { id: invoice.id },
      });
    }

    // delete quotations + items
    const quotations = await prisma.quotation.findMany({
      where: { customerId: id },
      select: { id: true },
    });

    for (const q of quotations) {
      await prisma.quotationItem.deleteMany({
        where: { quotationId: q.id },
      });

      await prisma.quotation.delete({
        where: { id: q.id },
      });
    }

    // 3. Finally delete customer
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE CUSTOMER ERROR:", err);

    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
