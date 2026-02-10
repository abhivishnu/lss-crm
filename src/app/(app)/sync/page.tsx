"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SyncStatus {
  lastSync: {
    id: string;
    syncType: string;
    status: string;
    message: string | null;
    rowsSynced: number;
    startedAt: string;
    completedAt: string | null;
  } | null;
  configured: boolean;
}

export default function SyncPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      setSyncStatus(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      fetchStatus();
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google Sheets Sync</h1>
        <p className="text-sm text-gray-500 mt-1">
          Keep your data mirrored in Google Sheets for easy access outside the app
        </p>
      </div>

      {/* Connection Status */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              syncStatus?.configured ? "bg-green-500" : "bg-red-400"
            }`}
          />
          <h3 className="font-semibold text-gray-900">
            {syncStatus?.configured
              ? "Google Sheets Connected"
              : "Google Sheets Not Configured"}
          </h3>
        </div>

        {!syncStatus?.configured ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-2">Setup Required</p>
            <p className="mb-3">
              To enable Google Sheets sync, you need to configure the following
              environment variables:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-mono">
              <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
              <li>GOOGLE_PRIVATE_KEY</li>
              <li>GOOGLE_SPREADSHEET_ID</li>
            </ul>
            <p className="mt-3 text-xs">
              See the README for detailed setup instructions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The app database is the source of truth. Sync pushes all contacts
              and interactions to your Google Sheet. The sheet is organized into
              two tabs: <strong>Contacts</strong> and{" "}
              <strong>Interactions</strong>.
            </p>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-gold flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                  </svg>
                  Sync Now
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Last Sync Info */}
      {syncStatus?.lastSync && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Last Sync</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-400">Status</dt>
              <dd>
                <span
                  className={`badge ${
                    syncStatus.lastSync.status === "success"
                      ? "bg-green-100 text-green-700"
                      : syncStatus.lastSync.status === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {syncStatus.lastSync.status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Started</dt>
              <dd className="text-gray-700">
                {new Date(syncStatus.lastSync.startedAt).toLocaleString()}
              </dd>
            </div>
            {syncStatus.lastSync.completedAt && (
              <div className="flex justify-between">
                <dt className="text-gray-400">Completed</dt>
                <dd className="text-gray-700">
                  {new Date(syncStatus.lastSync.completedAt).toLocaleString()}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-400">Rows Synced</dt>
              <dd className="text-gray-700">{syncStatus.lastSync.rowsSynced}</dd>
            </div>
            {syncStatus.lastSync.message && (
              <div className="flex justify-between">
                <dt className="text-gray-400">Message</dt>
                <dd className="text-gray-700 text-right max-w-[300px]">
                  {syncStatus.lastSync.message}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* How It Works */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">How Sync Works</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-navy">
              1
            </div>
            <p>
              <strong>App is source of truth.</strong> All data entry and edits
              happen here in the CRM app.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-navy">
              2
            </div>
            <p>
              <strong>One-way push sync.</strong> Clicking &quot;Sync Now&quot; pushes all
              data from the app to Google Sheets, overwriting the sheet contents.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-navy">
              3
            </div>
            <p>
              <strong>Human-readable format.</strong> The sheet uses clear column
              headers, standard date formats, and Y/N for booleans.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-navy">
              4
            </div>
            <p>
              <strong>Two tabs:</strong> &quot;Contacts&quot; mirrors all contact
              records; &quot;Interactions&quot; mirrors the interaction log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
