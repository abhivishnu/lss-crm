import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      interactions: { orderBy: { date: "desc" } },
      auditLogs: { orderBy: { changedAt: "desc" }, take: 50 },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const existing = await prisma.contact.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Parse dates
    if (data.nextFollowUpDate)
      data.nextFollowUpDate = new Date(data.nextFollowUpDate);
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    // Track changes for audit log
    const auditEntries: {
      field: string;
      oldValue: string;
      newValue: string;
    }[] = [];
    for (const key of Object.keys(data)) {
      const oldVal = (existing as any)[key];
      const newVal = data[key];
      if (String(oldVal) !== String(newVal)) {
        auditEntries.push({
          field: key,
          oldValue: oldVal != null ? String(oldVal) : "",
          newValue: newVal != null ? String(newVal) : "",
        });
      }
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data,
    });

    // Write audit logs
    if (auditEntries.length > 0) {
      await prisma.auditLog.createMany({
        data: auditEntries.map((entry) => ({
          contactId: params.id,
          ...entry,
          changedBy: session.email,
        })),
      });
    }

    return NextResponse.json(contact);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update contact" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.contact.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete contact" },
      { status: 400 }
    );
  }
}
