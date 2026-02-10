import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { syncToSheets, getLastSyncStatus, isSheetsConfigured } from "@/lib/sheets";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncToSheets();
  return NextResponse.json(result);
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lastSync = await getLastSyncStatus();
  const configured = isSheetsConfigured();

  return NextResponse.json({ lastSync, configured });
}
