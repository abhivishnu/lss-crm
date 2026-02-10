import { google } from "googleapis";
import { prisma } from "./prisma";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) return null;

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheets() {
  const auth = getAuth();
  if (!auth) return null;
  return google.sheets({ version: "v4", auth });
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "";

const CONTACTS_HEADERS = [
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
  "notes_static",
  "lead_source",
  "referred_by",
  "service_interest",
  "budget_fit",
  "priority_score",
  "lead_status",
  "status_reason",
  "owner",
  "date_added",
  "last_contact_date",
  "next_follow_up_date",
  "next_step",
  "package_interested_in",
  "package_purchased",
  "start_date",
  "end_date",
  "client_status",
  "payment_status",
  "contract_sent",
  "contract_signed",
];

const INTERACTIONS_HEADERS = [
  "interaction_id",
  "date",
  "contact_id",
  "contact_name",
  "interaction_type",
  "summary",
  "outcome",
  "next_follow_up_date",
  "logged_by",
];

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

function contactToRow(c: any): string[] {
  return [
    c.id,
    c.contactType || "",
    c.primaryFirstName || "",
    c.primaryLastName || "",
    c.studentName || "",
    c.studentGradYear || "",
    c.email || "",
    c.phone || "",
    c.preferredContactMethod || "",
    c.city || "",
    c.state || "",
    c.schoolName || "",
    c.notesStatic || "",
    c.leadSource || "",
    c.referredBy || "",
    c.serviceInterest || "",
    c.budgetFit || "",
    c.priorityScore || "",
    c.leadStatus || "",
    c.statusReason || "",
    c.owner || "",
    formatDate(c.dateAdded),
    formatDate(c.lastContactDate),
    formatDate(c.nextFollowUpDate),
    c.nextStep || "",
    c.packageInterestedIn || "",
    c.packagePurchased || "",
    formatDate(c.startDate),
    formatDate(c.endDate),
    c.clientStatus || "",
    c.paymentStatus || "",
    c.contractSent ? "Y" : "N",
    c.contractSigned ? "Y" : "N",
  ];
}

function interactionToRow(i: any, contactName: string): string[] {
  return [
    i.id,
    formatDate(i.date),
    i.contactId,
    contactName,
    i.interactionType || "",
    i.summary || "",
    i.outcome || "",
    formatDate(i.nextFollowUpDate),
    i.loggedBy || "",
  ];
}

export async function syncToSheets(): Promise<{
  success: boolean;
  message: string;
  rowsSynced: number;
}> {
  const sheets = getSheets();
  if (!sheets || !SPREADSHEET_ID) {
    return {
      success: false,
      message:
        "Google Sheets not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SPREADSHEET_ID.",
      rowsSynced: 0,
    };
  }

  const syncLog = await prisma.syncLog.create({
    data: { syncType: "full", status: "in_progress" },
  });

  try {
    // Fetch all contacts and interactions
    const contacts = await prisma.contact.findMany({
      orderBy: { dateAdded: "desc" },
    });

    const interactions = await prisma.interaction.findMany({
      include: { contact: true },
      orderBy: { date: "desc" },
    });

    // Build contact rows
    const contactRows = [
      CONTACTS_HEADERS,
      ...contacts.map((c) => contactToRow(c)),
    ];

    // Build interaction rows
    const interactionRows = [
      INTERACTIONS_HEADERS,
      ...interactions.map((i) =>
        interactionToRow(
          i,
          `${i.contact.primaryFirstName} ${i.contact.primaryLastName}`
        )
      ),
    ];

    // Ensure sheets exist
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      const sheetNames =
        spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

      const requests: any[] = [];
      if (!sheetNames.includes("Contacts")) {
        requests.push({
          addSheet: { properties: { title: "Contacts" } },
        });
      }
      if (!sheetNames.includes("Interactions")) {
        requests.push({
          addSheet: { properties: { title: "Interactions" } },
        });
      }

      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: { requests },
        });
      }
    } catch (e: any) {
      // Sheets may already exist
    }

    // Clear and write Contacts
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: "Contacts!A:AH",
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Contacts!A1",
      valueInputOption: "RAW",
      requestBody: { values: contactRows },
    });

    // Clear and write Interactions
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: "Interactions!A:I",
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Interactions!A1",
      valueInputOption: "RAW",
      requestBody: { values: interactionRows },
    });

    // Format header rows bold
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      const sheetList = spreadsheet.data.sheets || [];
      const formatRequests: any[] = [];

      for (const sheet of sheetList) {
        if (
          sheet.properties?.title === "Contacts" ||
          sheet.properties?.title === "Interactions"
        ) {
          formatRequests.push({
            repeatCell: {
              range: {
                sheetId: sheet.properties?.sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: {
                    red: 0.106,
                    green: 0.176,
                    blue: 0.431,
                  },
                  horizontalAlignment: "CENTER",
                },
              },
              fields:
                "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)",
            },
          });
        }
      }

      if (formatRequests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: { requests: formatRequests },
        });
      }
    } catch {
      // Formatting is optional
    }

    const totalRows = contacts.length + interactions.length;

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "success",
        message: `Synced ${contacts.length} contacts and ${interactions.length} interactions`,
        rowsSynced: totalRows,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Synced ${contacts.length} contacts and ${interactions.length} interactions to Google Sheets`,
      rowsSynced: totalRows,
    };
  } catch (error: any) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "error",
        message: error.message || "Unknown error during sync",
        completedAt: new Date(),
      },
    });

    return {
      success: false,
      message: error.message || "Sync failed",
      rowsSynced: 0,
    };
  }
}

export async function getLastSyncStatus() {
  const lastSync = await prisma.syncLog.findFirst({
    orderBy: { startedAt: "desc" },
  });
  return lastSync;
}

export function isSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SPREADSHEET_ID
  );
}
