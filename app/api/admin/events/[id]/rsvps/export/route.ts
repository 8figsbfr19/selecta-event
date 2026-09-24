import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { rsvps: { orderBy: { createdAt: "asc" } } },
  });
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const header = ["Name", "Email", "Phone", "Guests", "RSVP Date"];
  const rows = event.rsvps.map((r) => [
    r.name,
    r.email,
    r.phone || "",
    String(r.guests),
    r.createdAt.toISOString(),
  ]);

  const csv = [header, ...rows].map((row) => row.map((v) => csvEscape(v)).join(",")).join("\n");
  const filename = `${event.slug}-rsvps.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
