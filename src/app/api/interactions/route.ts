import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");

  const where: any = {};
  if (contactId) where.contactId = contactId;

  const interactions = await prisma.interaction.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      contact: {
        select: {
          primaryFirstName: true,
          primaryLastName: true,
        },
      },
    },
  });

  return NextResponse.json(interactions);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.contactId || !data.interactionType || !data.summary) {
      return NextResponse.json(
        { error: "contactId, interactionType, and summary are required" },
        { status: 400 }
      );
    }

    if (data.date) data.date = new Date(data.date);
    if (data.nextFollowUpDate)
      data.nextFollowUpDate = new Date(data.nextFollowUpDate);

    data.loggedBy = session.email;

    const interaction = await prisma.interaction.create({ data });

    // Update contact's lastContactDate
    const latestInteraction = await prisma.interaction.findFirst({
      where: { contactId: data.contactId },
      orderBy: { date: "desc" },
    });

    const updateData: any = {};
    if (latestInteraction) {
      updateData.lastContactDate = latestInteraction.date;
    }
    if (data.nextFollowUpDate) {
      updateData.nextFollowUpDate = data.nextFollowUpDate;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.contact.update({
        where: { id: data.contactId },
        data: updateData,
      });
    }

    return NextResponse.json(interaction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create interaction" },
      { status: 400 }
    );
  }
}
