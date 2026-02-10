"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import ContactForm from "@/components/ContactForm";
import InteractionForm from "@/components/InteractionForm";
import { StatusBadge, PriorityBadge, OverdueBadge, UpcomingBadge } from "@/components/Badge";
import { PIPELINE_STATUSES, LEAD_SOURCES, PRIORITY_SCORES, LEAD_STATUSES } from "@/lib/constants";
import toast from "react-hot-toast";

export default function PipelinePage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [interactionContactId, setInteractionContactId] = useState<string | null>(null);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickStatus, setQuickStatus] = useState("");
  const [quickFollowUp, setQuickFollowUp] = useState("");

  const fetchContacts = useCallback(() => {
    const statuses = PIPELINE_STATUSES.join(",");
    const params = new URLSearchParams({
      status: statuses,
      sortBy: "nextFollowUpDate",
      sortDir: "asc",
    });
    if (search) params.set("search", search);
    if (filterSource) params.set("leadSource", filterSource);
    if (filterPriority) params.set("priority", filterPriority);

    fetch(`/api/contacts?${params}`)
      .then((r) => r.json())
      .then(setContacts)
      .finally(() => setLoading(false));
  }, [search, filterSource, filterPriority]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  function getFollowUpStatus(dateStr: string | null) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 0) return "overdue";
    if (diffHours < 48) return "upcoming";
    return null;
  }

  async function handleQuickUpdate(contactId: string) {
    const body: any = {};
    if (quickStatus) body.leadStatus = quickStatus;
    if (quickFollowUp) body.nextFollowUpDate = quickFollowUp;

    if (Object.keys(body).length === 0) {
      setQuickEditId(null);
      return;
    }

    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Updated");
      setQuickEditId(null);
      setQuickStatus("");
      setQuickFollowUp("");
      fetchContacts();
    } catch {
      toast.error("Failed to update contact");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contacts.length} leads in pipeline
          </p>
        </div>
        <button
          onClick={() => setShowAddContact(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="select max-w-[180px]"
        >
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="select max-w-[150px]"
        >
          <option value="">All Priorities</option>
          {PRIORITY_SCORES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No contacts in the pipeline match your filters.</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Follow-Up</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Next Step</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => {
                  const fuStatus = getFollowUpStatus(contact.nextFollowUpDate);
                  const isDoNotContact = contact.leadStatus === "Do Not Contact";

                  return (
                    <tr
                      key={contact.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        isDoNotContact ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link href={`/contacts/${contact.id}`} className="hover:text-brand-navy">
                          <div className="font-medium text-gray-900">
                            {contact.primaryFirstName} {contact.primaryLastName}
                          </div>
                          {contact.studentName && (
                            <div className="text-xs text-gray-400">
                              Student: {contact.studentName}
                              {contact.studentGradYear && ` '${contact.studentGradYear.slice(-2)}`}
                            </div>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={contact.leadStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={contact.priorityScore} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {contact.leadSource}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {contact.nextFollowUpDate ? (
                            <span className="text-gray-700">
                              {new Date(contact.nextFollowUpDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-300">Not set</span>
                          )}
                          {fuStatus === "overdue" && <OverdueBadge />}
                          {fuStatus === "upcoming" && <UpcomingBadge />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                        {contact.nextStep || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {quickEditId === contact.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={quickStatus}
                                onChange={(e) => setQuickStatus(e.target.value)}
                                className="select !py-1 text-xs max-w-[140px]"
                              >
                                <option value="">Status...</option>
                                {LEAD_STATUSES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <input
                                type="date"
                                value={quickFollowUp}
                                onChange={(e) => setQuickFollowUp(e.target.value)}
                                className="input !py-1 text-xs max-w-[130px]"
                              />
                              <button
                                onClick={() => handleQuickUpdate(contact.id)}
                                className="text-green-600 hover:text-green-700 p-1"
                                title="Save"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </button>
                              <button
                                onClick={() => { setQuickEditId(null); setQuickStatus(""); setQuickFollowUp(""); }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setQuickEditId(contact.id)}
                                className="btn-ghost !px-2 !py-1 text-xs"
                                title="Quick edit"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setInteractionContactId(contact.id)}
                                className="btn-ghost !px-2 !py-1 text-xs"
                                title="Log interaction"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              </button>
                              <Link
                                href={`/contacts/${contact.id}`}
                                className="btn-ghost !px-2 !py-1 text-xs"
                                title="View details"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      <Modal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        title="Add New Contact"
        wide
      >
        <ContactForm
          onSaved={() => {
            setShowAddContact(false);
            fetchContacts();
          }}
          onCancel={() => setShowAddContact(false)}
        />
      </Modal>

      {/* Log Interaction Modal */}
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
              fetchContacts();
            }}
            onCancel={() => setInteractionContactId(null)}
          />
        )}
      </Modal>
    </div>
  );
}
