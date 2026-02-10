import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Counts by status
  const statusCounts = await prisma.contact.groupBy({
    by: ["leadStatus"],
    _count: { id: true },
  });

  // Lead source performance
  const sourceCounts = await prisma.contact.groupBy({
    by: ["leadSource"],
    _count: { id: true },
  });

  // Won by source (conversion)
  const wonBySource = await prisma.contact.groupBy({
    by: ["leadSource"],
    where: { leadStatus: "Won – Active Client" },
    _count: { id: true },
  });

  // Total contacts
  const totalContacts = await prisma.contact.count();

  // Active clients
  const activeClients = await prisma.contact.count({
    where: {
      OR: [
        { leadStatus: "Won – Active Client" },
        { clientStatus: "Active" },
      ],
    },
  });

  // Overdue follow-ups
  const overdueFollowUps = await prisma.contact.count({
    where: {
      nextFollowUpDate: { lt: now },
      leadStatus: { notIn: ["Lost", "Do Not Contact"] },
    },
  });

  // Follow-ups due today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const followUpsDueToday = await prisma.contact.count({
    where: {
      nextFollowUpDate: { gte: todayStart, lte: todayEnd },
    },
  });

  // New leads this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newLeadsThisMonth = await prisma.contact.count({
    where: { dateAdded: { gte: monthStart } },
  });

  // Pipeline value (contacts in active pipeline stages)
  const pipelineCount = await prisma.contact.count({
    where: {
      leadStatus: {
        in: [
          "New Lead",
          "Contacted",
          "Discovery Scheduled",
          "Discovery Completed",
          "Proposal Sent",
          "Decision Pending",
        ],
      },
    },
  });

  // Conversion rate
  const totalLeads = await prisma.contact.count({
    where: {
      leadStatus: {
        notIn: ["Do Not Contact"],
      },
    },
  });
  const wonCount = await prisma.contact.count({
    where: { leadStatus: "Won – Active Client" },
  });
  const conversionRate =
    totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : "0";

  // Recent interactions
  const recentInteractions = await prisma.interaction.findMany({
    take: 5,
    orderBy: { date: "desc" },
    include: {
      contact: {
        select: { primaryFirstName: true, primaryLastName: true },
      },
    },
  });

  // Upcoming follow-ups (next 7 days)
  const weekFromNow = new Date(now);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const upcomingFollowUps = await prisma.contact.findMany({
    where: {
      nextFollowUpDate: { gte: now, lte: weekFromNow },
      leadStatus: { notIn: ["Lost", "Do Not Contact"] },
    },
    orderBy: { nextFollowUpDate: "asc" },
    take: 10,
    select: {
      id: true,
      primaryFirstName: true,
      primaryLastName: true,
      studentName: true,
      nextFollowUpDate: true,
      nextStep: true,
      leadStatus: true,
      priorityScore: true,
    },
  });

  return NextResponse.json({
    statusCounts: statusCounts.map((s) => ({
      status: s.leadStatus,
      count: s._count.id,
    })),
    sourceCounts: sourceCounts.map((s) => ({
      source: s.leadSource,
      count: s._count.id,
    })),
    wonBySource: wonBySource.map((s) => ({
      source: s.leadSource,
      count: s._count.id,
    })),
    totalContacts,
    activeClients,
    overdueFollowUps,
    followUpsDueToday,
    newLeadsThisMonth,
    pipelineCount,
    conversionRate,
    recentInteractions,
    upcomingFollowUps,
  });
}
