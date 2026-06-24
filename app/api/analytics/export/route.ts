import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = verifyToken(token);

    const orgId = decoded.orgId;

    const workbook = new ExcelJS.Workbook();

    // =====================
    // SUMMARY SHEET
    // =====================

    const summary = workbook.addWorksheet("Summary");

    summary.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];

    const revenue = await prisma.payment.aggregate({
      where: {
        organizationId: orgId,
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    });

    const expenses = await prisma.expense.aggregate({
      where: {
        organizationId: orgId,
      },
      _sum: {
        amount: true,
      },
    });

    summary.addRows([
      {
        metric: "Revenue",
        value: revenue._sum.amount ?? 0,
      },
      {
        metric: "Expenses",
        value: expenses._sum.amount ?? 0,
      },
      {
        metric: "Profit",
        value: (revenue._sum.amount ?? 0) - (expenses._sum.amount ?? 0),
      },
    ]);

    // =====================
    // PRODUCTS SHEET
    // =====================

    const productsSheet = workbook.addWorksheet("Products");

    productsSheet.columns = [
      { header: "Product", key: "name", width: 30 },
      { header: "Price", key: "price", width: 15 },
      { header: "Stock", key: "stock", width: 15 },
    ];

    const products = await prisma.product.findMany({
      where: {
        organizationId: orgId,
      },
    });

    productsSheet.addRows(products);

    // =====================
    // INVOICES SHEET
    // =====================

    const invoicesSheet = workbook.addWorksheet("Invoices");

    invoicesSheet.columns = [
      { header: "Invoice #", key: "invoiceNumber", width: 20 },
      { header: "Status", key: "status", width: 20 },
      { header: "Total", key: "total", width: 20 },
    ];

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: orgId,
      },
    });

    invoicesSheet.addRows(invoices);

    const fileName = `analytics-${Date.now()}.xlsx`;

    const filePath = path.join(process.cwd(), "public", "exports", fileName);

    await workbook.xlsx.writeFile(filePath);

    return NextResponse.json({
      url: `/exports/${fileName}`,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
