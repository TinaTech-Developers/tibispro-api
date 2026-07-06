import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { Plan, OrgStatus } from "@prisma/client";

// ==============================
// GET ORGANIZATION
// ==============================
// ==============================
// GET ORGANIZATION DASHBOARD
// ==============================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },

      include: {
        users: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },

        customers: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,

          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },

        invoices: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,

          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },

        subscriptionPayments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },

        _count: {
          select: {
            users: true,
            customers: true,
            products: true,
            invoices: true,
            quotations: true,
            expenses: true,
            payments: true,
            subscriptionPayments: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Revenue
    const revenue = await prisma.payment.aggregate({
      where: {
        organizationId: id,
        status: "PAID",
      },

      _sum: {
        amount: true,
      },
    });

    // Invoice totals
    const invoices = await prisma.invoice.aggregate({
      where: {
        organizationId: id,
      },

      _sum: {
        total: true,
      },

      _avg: {
        total: true,
      },
    });

    // Latest activity
    const latestPayment = await prisma.subscriptionPayment.findFirst({
      where: {
        organizationId: id,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...organization,

      dashboard: {
        revenue: revenue._sum.amount ?? 0,

        totalInvoiceValue: invoices._sum.total ?? 0,

        averageInvoiceValue: invoices._avg.total ?? 0,

        latestActivity: latestPayment?.createdAt ?? null,
      },
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}
// ==============================
// UPDATE ORGANIZATION
// ==============================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { plan, status, isSetupComplete } = body;

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(plan && { plan: plan as Plan }),
        ...(status && { status: status as OrgStatus }),
        ...(typeof isSetupComplete === "boolean" ? { isSetupComplete } : {}),
      },
    });

    return NextResponse.json({
      message: "Organization updated successfully",
      organization,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ==============================
// DELETE ORGANIZATION
// ==============================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Prevent deleting an organization that owns the last SUPER_ADMIN
    const superAdmins = organization.users.filter(
      (u) => u.role === "SUPER_ADMIN",
    );

    if (superAdmins.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete an organization containing SUPER_ADMIN accounts.",
        },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.stockMovement.deleteMany({
        where: { organizationId: id },
      }),

      prisma.payment.deleteMany({
        where: { organizationId: id },
      }),

      prisma.invoiceItem.deleteMany({
        where: {
          invoice: {
            organizationId: id,
          },
        },
      }),

      prisma.invoice.deleteMany({
        where: { organizationId: id },
      }),

      prisma.quotationItem.deleteMany({
        where: {
          quotation: {
            organizationId: id,
          },
        },
      }),

      prisma.quotation.deleteMany({
        where: { organizationId: id },
      }),

      prisma.customer.deleteMany({
        where: { organizationId: id },
      }),

      prisma.product.deleteMany({
        where: { organizationId: id },
      }),

      prisma.expense.deleteMany({
        where: { organizationId: id },
      }),

      prisma.file.deleteMany({
        where: { organizationId: id },
      }),

      prisma.subscriptionPayment.deleteMany({
        where: { organizationId: id },
      }),

      prisma.user.deleteMany({
        where: { organizationId: id },
      }),

      prisma.organization.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      message: "Organization deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
