"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import ContactForm from "@/components/ContactForm";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/Badge";
import { LEAD_STATUSES, LEAD_SOURCES, CONTACT_TYPES } from "@/lib/constants";
import toast from "react-hot-toast";

export default function AllContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fetchContacts = useCallback(() => {
    const params = new URLSearchParams({
      sortBy: "dateAdded",
      sortDir: "desc",
    });
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    if (filterSource) params.set("leadSource", filterSource);

    fetch(`/api/contacts?${params}`)
      .then((r) => r.json())
      .then(setContacts)
      .finally(() => setLoading(false));
  }, [search, filterStatus, filterSource]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  function handleExport() {
    window.open("/api/contacts/export", "_blank");
    toast.success("Downloading CSV...");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contacts.length} total contacts
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm">
            Export CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, email, school..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select max-w-[200px]"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No contacts found.</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Added</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => {
                  const isDoNotContact = c.leadStatus === "Do Not Contact";
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        isDoNotContact ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/contacts/${c.id}`}
                          className="font-medium text-gray-900 hover:text-brand-navy"
                        >
                          {c.primaryFirstName} {c.primaryLastName}
                        </Link>
                        {c.studentName && (
                          <div className="text-xs text-gray-400">
                            {c.studentName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.contactType}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.leadStatus} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.email || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{c.phone || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{c.leadSource || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(c.dateAdded).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Contact" wide>
        <ContactForm
          onSaved={() => {
            setShowAdd(false);
            fetchContacts();
          }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  );
}
