import { prisma } from "@/lib/prisma";

export async function GET() {
  const orgs = await prisma.organization.findMany();

  return Response.json({
    success: true,
    data: orgs,
  });
}
