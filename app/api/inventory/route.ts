import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

import { JwtPayload } from "jsonwebtoken";

type AuthPayload = JwtPayload & {
  organizationId: string;
};

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as AuthPayload;

    if (!decoded.organizationId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: {
        organizationId: decoded.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // enrich products with inventory status
    const enriched = products.map((p) => ({
      ...p,
      stockStatus: p.stock <= 10 ? "LOW" : "OK", // you can later replace with minStock column if you add it
    }));

    return NextResponse.json({
      products: enriched,
    });
  } catch (err) {
    console.log("INVENTORY GET ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as AuthPayload;

    if (!decoded.organizationId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const body = await req.json();
    const { name, price, cost, stock, type } = body;

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        cost: Number(cost || 0),
        stock: Number(stock || 0),
        type: type || "Product",
        organizationId: decoded.organizationId,
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.log("INVENTORY CREATE ERROR:", err);

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
