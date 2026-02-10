import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    orderBy: { dateAdded: "desc" },
  });

  const headers = [
    "contact_id",
    "contact_type",
    "primary_first_name",
    "primary_last_name",
    "student_name",
    "student_grad_year",
    "email",
    "phone",
    "preferred_contact_method",
    "city",
    "state",
    "school_name",
    "lead_source",
    "referred_by",
    "service_interest",
    "budget_fit",
    "priority_score",
    "lead_status",
    "status_reason",
    "next_follow_up_date",
    "next_step",
    "package_purchased",
    "client_status",
    "payment_status",
    "contract_sent",
    "contract_signed",
    "notes_static",
  ];

  function esc(val: any): string {
    if (val == null) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  function fmtDate(d: Date | null): string {
    if (!d) return "";
    return d.toISOString().split("T")[0];
  }

  const rows = contacts.map((c) =>
    [
      c.id,
      c.contactType,
      c.primaryFirstName,
      c.primaryLastName,
      c.studentName,
      c.studentGradYear,
      c.email,
      c.phone,
      c.preferredContactMethod,
      c.city,
      c.state,
      c.schoolName,
      c.leadSource,
      c.referredBy,
      c.serviceInterest,
      c.budgetFit,
      c.priorityScore,
      c.leadStatus,
      c.statusReason,
      fmtDate(c.nextFollowUpDate),
      c.nextStep,
      c.packagePurchased,
      c.clientStatus,
      c.paymentStatus,
      c.contractSent ? "Y" : "N",
      c.contractSigned ? "Y" : "N",
      c.notesStatic,
    ]
      .map(esc)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="contacts_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
