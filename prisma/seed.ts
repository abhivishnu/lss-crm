import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.syncLog.deleteMany();

  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        contactType: "Parent",
        primaryFirstName: "Maria",
        primaryLastName: "Garcia",
        studentName: "Sofia Garcia",
        studentGradYear: "2026",
        email: "maria.garcia@email.com",
        phone: "512-555-0101",
        preferredContactMethod: "Email",
        city: "Austin",
        state: "TX",
        schoolName: "Westlake High School",
        leadSource: "Referral",
        referredBy: "Johnson Family",
        serviceInterest: "Comprehensive",
        budgetFit: "High",
        priorityScore: "Hot",
        leadStatus: "Discovery Completed",
        nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        nextStep: "Send comprehensive package proposal",
        notesStatic: "Very motivated family. Sofia interested in Ivy League schools.",
      },
    }),
    prisma.contact.create({
      data: {
        contactType: "Parent",
        primaryFirstName: "James",
        primaryLastName: "Wilson",
        studentName: "Tyler Wilson",
        studentGradYear: "2026",
        email: "jwilson@email.com",
        phone: "214-555-0202",
        preferredContactMethod: "Call",
        city: "Dallas",
        state: "TX",
        schoolName: "Highland Park High School",
        leadSource: "Google",
        serviceInterest: "Essays",
        budgetFit: "Medium",
        priorityScore: "Warm",
        leadStatus: "Contacted",
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        nextStep: "Schedule discovery call",
        notesStatic: "Found us through Google search. Interested primarily in essay support.",
      },
    }),
    prisma.contact.create({
      data: {
        contactType: "Student",
        primaryFirstName: "Aiden",
        primaryLastName: "Patel",
        studentGradYear: "2027",
        email: "aiden.p@email.com",
        phone: "832-555-0303",
        preferredContactMethod: "Text",
        city: "Houston",
        state: "TX",
        schoolName: "Memorial High School",
        leadSource: "Instagram",
        serviceInterest: "Academic Planning",
        budgetFit: "Unknown",
        priorityScore: "Cold",
        leadStatus: "New Lead",
        nextFollowUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextStep: "Initial outreach via text",
        notesStatic: "Junior, reached out via Instagram DM.",
      },
    }),
    prisma.contact.create({
      data: {
        contactType: "Parent",
        primaryFirstName: "Sarah",
        primaryLastName: "Thompson",
        studentName: "Emma Thompson",
        studentGradYear: "2025",
        email: "sarah.t@email.com",
        phone: "512-555-0404",
        preferredContactMethod: "Email",
        city: "Austin",
        state: "TX",
        schoolName: "Anderson High School",
        leadSource: "Workshop",
        serviceInterest: "Comprehensive",
        budgetFit: "High",
        priorityScore: "Hot",
        leadStatus: "Won – Active Client",
        clientStatus: "Active",
        packagePurchased: "Comprehensive Senior Package",
        startDate: new Date("2024-08-01"),
        endDate: new Date("2025-05-31"),
        paymentStatus: "Paid",
        contractSent: true,
        contractSigned: true,
        lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        nextStep: "Review final application list",
        notesStatic: "Active client. Emma applying to UT Austin, Rice, and several OOS schools.",
      },
    }),
    prisma.contact.create({
      data: {
        contactType: "Parent",
        primaryFirstName: "Robert",
        primaryLastName: "Chen",
        studentName: "Michael Chen",
        studentGradYear: "2026",
        email: "rchen@email.com",
        phone: "210-555-0505",
        preferredContactMethod: "Email",
        city: "San Antonio",
        state: "TX",
        schoolName: "Alamo Heights High School",
        leadSource: "Referral",
        referredBy: "Thompson Family",
        serviceInterest: "Test Planning",
        budgetFit: "Medium",
        priorityScore: "Warm",
        leadStatus: "Proposal Sent",
        nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        nextStep: "Follow up on test prep proposal",
        notesStatic: "Referred by Sarah Thompson. Michael needs SAT prep.",
      },
    }),
    prisma.contact.create({
      data: {
        contactType: "Partner",
        primaryFirstName: "Dr. Lisa",
        primaryLastName: "Martinez",
        email: "lmartinez@school.edu",
        phone: "512-555-0606",
        preferredContactMethod: "Email",
        city: "Austin",
        state: "TX",
        schoolName: "Round Rock ISD",
        leadSource: "School Partner",
        priorityScore: "Hot",
        leadStatus: "Won – Active Client",
        clientStatus: "Active",
        notesStatic: "School counselor partnership. Refers families for college prep.",
      },
    }),
    prisma.contact.create({
      data: {
        contactType: "Parent",
        primaryFirstName: "Karen",
        primaryLastName: "Davis",
        studentName: "Jake Davis",
        studentGradYear: "2026",
        email: "kdavis@email.com",
        phone: "972-555-0707",
        preferredContactMethod: "Text",
        city: "Plano",
        state: "TX",
        schoolName: "Plano West Senior High",
        leadSource: "Past Client",
        serviceInterest: "Scholarships",
        budgetFit: "Low",
        priorityScore: "Warm",
        leadStatus: "Nurture",
        nextFollowUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        nextStep: "Check in after scholarship workshop",
        notesStatic: "Previous client for older sibling. Budget-conscious but interested.",
      },
    }),
    prisma.contact.create({
      data: {
        contactType: "Parent",
        primaryFirstName: "David",
        primaryLastName: "Kim",
        studentName: "Grace Kim",
        studentGradYear: "2026",
        email: "dkim@email.com",
        phone: "512-555-0808",
        city: "Austin",
        state: "TX",
        schoolName: "LASA High School",
        leadSource: "Referral",
        referredBy: "Dr. Martinez",
        serviceInterest: "Comprehensive",
        budgetFit: "High",
        priorityScore: "Hot",
        leadStatus: "Discovery Scheduled",
        nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        nextStep: "Discovery call Tuesday at 4pm",
        notesStatic: "Grace is top of class at LASA. Very competitive applicant.",
      },
    }),
  ]);

  // Add interactions
  await prisma.interaction.createMany({
    data: [
      {
        contactId: contacts[0].id,
        interactionType: "Call",
        summary: "Initial discovery call. Discussed Sofia's college goals and family priorities.",
        outcome: "Very interested in comprehensive package",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: contacts[0].id,
        interactionType: "Email",
        summary: "Sent follow-up summary of discovery call with service overview.",
        outcome: "Acknowledged receipt, reviewing with spouse",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: contacts[1].id,
        interactionType: "Email",
        summary: "Responded to inquiry from website contact form.",
        outcome: "Interested, wants to learn more about essay services",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: contacts[3].id,
        interactionType: "Meeting",
        summary: "Monthly check-in. Reviewed essay progress for UT Austin and Rice applications.",
        outcome: "On track, essays need one more revision",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: contacts[3].id,
        interactionType: "Email",
        summary: "Sent revised essay outlines and timeline for remaining applications.",
        outcome: "Confirmed plan",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: contacts[4].id,
        interactionType: "Call",
        summary: "Discussed SAT prep options and timeline for Michael.",
        outcome: "Sent proposal for test prep package",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: contacts[7].id,
        interactionType: "Email",
        summary: "Introduction from Dr. Martinez. Scheduled discovery call.",
        outcome: "Discovery call set for next Tuesday",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Update last contact dates
  for (const contact of contacts) {
    const lastInteraction = await prisma.interaction.findFirst({
      where: { contactId: contact.id },
      orderBy: { date: "desc" },
    });
    if (lastInteraction) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { lastContactDate: lastInteraction.date },
      });
    }
  }

  console.log("Seed data created successfully!");
  console.log(`Created ${contacts.length} contacts with interactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
