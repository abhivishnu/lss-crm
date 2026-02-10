import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clientStatus = searchParams.get("clientStatus");
  const search = searchParams.get("search");
  const leadSource = searchParams.get("leadSource");
  const priority = searchParams.get("priority");
  const sortBy = searchParams.get("sortBy") || "nextFollowUpDate";
  const sortDir = searchParams.get("sortDir") || "asc";

  const where: any = {};

  if (status) {
    if (status.includes(",")) {
      where.leadStatus = { in: status.split(",") };
    } else {
      where.leadStatus = status;
    }
  }

  if (clientStatus) {
    where.clientStatus = clientStatus;
  }

  if (leadSource) {
    where.leadSource = leadSource;
  }

  if (priority) {
    where.priorityScore = priority;
  }

  if (search) {
    where.OR = [
      { primaryFirstName: { contains: search } },
      { primaryLastName: { contains: search } },
      { studentName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
      { schoolName: { contains: search } },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: [
      { [sortBy]: sortDir === "desc" ? "desc" : "asc" },
      { priorityScore: "asc" },
    ],
    include: {
      _count: {
        select: { interactions: true },
      },
    },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Parse dates
    if (data.nextFollowUpDate)
      data.nextFollowUpDate = new Date(data.nextFollowUpDate);
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const contact = await prisma.contact.create({ data });

    // Audit log
    await prisma.auditLog.create({
      data: {
        contactId: contact.id,
        field: "created",
        newValue: `${contact.primaryFirstName} ${contact.primaryLastName}`,
        changedBy: session.email,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create contact" },
      { status: 400 }
    );
  }
}
