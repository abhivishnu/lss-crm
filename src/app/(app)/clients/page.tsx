"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import InteractionForm from "@/components/InteractionForm";
import { ActiveClientBadge, OverdueBadge, PriorityBadge } from "@/components/Badge";
import { PAYMENT_STATUSES } from "@/lib/constants";
import toast from "react-hot-toast";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [interactionContactId, setInteractionContactId] = useState<string | null>(null);

  const fetchClients = useCallback(() => {
    const params = new URLSearchParams({
      status: "Won – Active Client",
      sortBy: "nextFollowUpDate",
      sortDir: "asc",
    });
    if (search) params.set("search", search);

    fetch(`/api/contacts?${params}`)
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  async function quickUpdateField(contactId: string, field: string, value: any) {
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Updated");
      fetchClients();
    } catch {
      toast.error("Update failed");
    }
  }

  function isOverdue(dateStr: string | null) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clients.length} active client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy" />
        </div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No active clients found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="card !p-0 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/contacts/${client.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-brand-navy transition-colors"
                    >
                      {client.primaryFirstName} {client.primaryLastName}
                    </Link>
                    {client.studentName && (
                      <p className="text-sm text-gray-500">
                        Student: {client.studentName}
                        {client.studentGradYear && ` (Class of ${client.studentGradYear})`}
                      </p>
                    )}
                    {client.schoolName && (
                      <p className="text-xs text-gray-400 mt-0.5">{client.schoolName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ActiveClientBadge />
                    {isOverdue(client.nextFollowUpDate) && <OverdueBadge />}
                  </div>
                </div>

                {/* Onboarding Info */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Package</div>
                    <div className="text-sm font-medium text-gray-700">
                      {client.packagePurchased || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Payment</div>
                    <select
                      value={client.paymentStatus || "Not invoiced"}
                      onChange={(e) =>
                        quickUpdateField(client.id, "paymentStatus", e.target.value)
                      }
                      className={`select !py-1 text-xs ${
                        client.paymentStatus === "Paid"
                          ? "text-green-700 bg-green-50"
                          : client.paymentStatus === "Invoiced"
                          ? "text-yellow-700 bg-yellow-50"
                          : ""
                      }`}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Contract</div>
                    <div className="flex gap-3 text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={client.contractSent}
                          onChange={(e) =>
                            quickUpdateField(client.id, "contractSent", e.target.checked)
                          }
                          className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                        />
                        Sent
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={client.contractSigned}
                          onChange={(e) =>
                            quickUpdateField(client.id, "contractSigned", e.target.checked)
                          }
                          className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                        />
                        Signed
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Next Follow-Up</div>
                    <div className="text-sm text-gray-700">
                      {client.nextFollowUpDate
                        ? new Date(client.nextFollowUpDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not set"}
                    </div>
                  </div>
                </div>

                {client.nextStep && (
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-gray-400">Next: </span>
                    {client.nextStep}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center gap-3">
                <button
                  onClick={() => setInteractionContactId(client.id)}
                  className="btn-ghost text-xs flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Log Interaction
                </button>
                <Link
                  href={`/contacts/${client.id}`}
                  className="btn-ghost text-xs flex items-center gap-1"
                >
                  View Details
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!interactionContactId}
        onClose={() => setInteractionContactId(null)}
        title="Log Interaction"
      >
        {interactionContactId && (
          <InteractionForm
            contactId={interactionContactId}
            onSaved={() => {
              setInteractionContactId(null);
              fetchClients();
            }}
            onCancel={() => setInteractionContactId(null)}
          />
        )}
      </Modal>
    </div>
  );
}
