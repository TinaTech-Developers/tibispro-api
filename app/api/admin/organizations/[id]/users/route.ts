// /app/api/admin/organizations/[id]/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // 👈 IMPORTANT FIX

  try {
    const admin = await verifyAdmin(req);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: id, // 👈 FIXED HERE
      ...(role && role !== "ALL" ? { role } : {}),
      ...(status && status !== "ALL" ? { status } : {}),
      ...(search ?
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch users" },
      { status: 500 },
    );
  }
}
