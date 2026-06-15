import { InvoiceStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const { invoiceId, amount, method, reference } = await req.json();

    if (!amount || !method) {
      return NextResponse.json(
        { error: "Amount and method required" },
        { status: 400 },
      );
    }

    let invoice = null;

    if (invoiceId) {
      invoice = await prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          organizationId: decoded.orgId,
        },
        include: {
          payments: true,
        },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 },
        );
      }
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoiceId || null,
        amount,
        method,
        reference,
        status: PaymentStatus.PAID, // ✅ FIXED
        organizationId: decoded.orgId,
      },
    });

    // 🧠 AUTO CALCULATE TOTAL PAID
    if (invoice) {
      const totalPaid =
        invoice.payments.reduce((sum, p) => sum + p.amount, 0) + amount;

      let status: InvoiceStatus = InvoiceStatus.PENDING;

      if (totalPaid >= invoice.total) {
        status = InvoiceStatus.PAID;
      }
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status,
        },
      });
    }

    return NextResponse.json({ payment });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const payments = await prisma.payment.findMany({
      where: {
        organizationId: decoded.orgId,
      },
      include: {
        invoice: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ payments });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}
