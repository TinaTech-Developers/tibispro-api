import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

import { JwtPayload } from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    if (!decoded.orgId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: {
        organizationId: decoded.orgId, // ✅ FIX HERE
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
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

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const { name, price, stock, cost, type } = await req.json();

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number(stock ?? 0),
        cost: Number(cost ?? 0),
        type: type ?? "Product",
        organizationId: decoded.orgId, // ✅ FIX HERE
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
