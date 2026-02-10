"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";
import ContactForm from "@/components/ContactForm";
import InteractionForm from "@/components/InteractionForm";
import { StatusBadge, PriorityBadge, OverdueBadge, ActiveClientBadge } from "@/components/Badge";
import toast from "react-hot-toast";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const fetchContact = useCallback(() => {
    fetch(`/api/contacts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setContact)
      .catch(() => {
        toast.error("Contact not found");
        router.push("/pipeline");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this contact? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Contact deleted");
      router.push("/pipeline");
    } catch {
      toast.error("Failed to delete contact");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy" />
      </div>
    );
  }

  if (!contact) return null;

  const isDoNotContact = contact.leadStatus === "Do Not Contact";
  const isActiveClient = contact.leadStatus === "Won – Active Client" || contact.clientStatus === "Active";
  const isOverdue = contact.nextFollowUpDate && new Date(contact.nextFollowUpDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/pipeline" className="hover:text-brand-navy">Pipeline</Link>
        <span>/</span>
        <span className="text-gray-900">
          {contact.primaryFirstName} {contact.primaryLastName}
        </span>
      </div>

      {/* Header */}
      <div className={`card ${isDoNotContact ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {contact.primaryFirstName} {contact.primaryLastName}
              </h1>
              <StatusBadge status={contact.leadStatus} />
              <PriorityBadge priority={contact.priorityScore} />
              {isActiveClient && <ActiveClientBadge />}
              {isOverdue && <OverdueBadge />}
            </div>
            {contact.studentName && (
              <p className="text-gray-500 mt-1">
                Student: {contact.studentName}
                {contact.studentGradYear && ` (Class of ${contact.studentGradYear})`}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              {contact.contactType}
              {contact.schoolName && ` · ${contact.schoolName}`}
              {contact.city && ` · ${contact.city}, ${contact.state}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInteraction(true)}
              className="btn-primary text-sm"
            >
              Log Interaction
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="btn-secondary text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn-ghost text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Email" value={contact.email} />
              <DetailRow label="Phone" value={contact.phone} />
              <DetailRow label="Preferred" value={contact.preferredContactMethod} />
              <DetailRow label="Lead Source" value={contact.leadSource} />
              {contact.referredBy && <DetailRow label="Referred By" value={contact.referredBy} />}
              <DetailRow label="Service Interest" value={contact.serviceInterest} />
              <DetailRow label="Budget Fit" value={contact.budgetFit} />
            </dl>
          </div>

          {/* Pipeline Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Pipeline</h3>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Status" value={contact.leadStatus} />
              {contact.statusReason && <DetailRow label="Reason" value={contact.statusReason} />}
              <DetailRow
                label="Next Follow-Up"
                value={
                  contact.nextFollowUpDate
                    ? new Date(contact.nextFollowUpDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null
                }
              />
              <DetailRow label="Next Step" value={contact.nextStep} />
              <DetailRow
                label="Last Contact"
                value={
                  contact.lastContactDate
                    ? new Date(contact.lastContactDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null
                }
              />
              <DetailRow
                label="Date Added"
                value={new Date(contact.dateAdded).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </dl>
          </div>

          {/* Client Info (if applicable) */}
          {(isActiveClient || contact.packagePurchased) && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Client Details</h3>
              <dl className="space-y-2 text-sm">
                <DetailRow label="Package" value={contact.packagePurchased} />
                <DetailRow label="Client Status" value={contact.clientStatus} />
                <DetailRow label="Payment" value={contact.paymentStatus} />
                <DetailRow label="Contract Sent" value={contact.contractSent ? "Yes" : "No"} />
                <DetailRow label="Contract Signed" value={contact.contractSigned ? "Yes" : "No"} />
                {contact.startDate && (
                  <DetailRow
                    label="Start"
                    value={new Date(contact.startDate).toLocaleDateString()}
                  />
                )}
                {contact.endDate && (
                  <DetailRow
                    label="End"
                    value={new Date(contact.endDate).toLocaleDateString()}
                  />
                )}
              </dl>
            </div>
          )}

          {/* Notes */}
          {contact.notesStatic && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {contact.notesStatic}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interaction Timeline */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Interactions ({contact.interactions?.length || 0})
              </h3>
              <button
                onClick={() => setShowInteraction(true)}
                className="btn-ghost text-xs flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
              </button>
            </div>

            {!contact.interactions?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No interactions logged yet.
              </p>
            ) : (
              <div className="space-y-0">
                {contact.interactions.map((interaction: any, i: number) => (
                  <div key={interaction.id} className="relative pl-8 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {i < contact.interactions.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-[22px] h-[22px] rounded-full bg-brand-navy/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-brand-navy" />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="badge bg-brand-navy/10 text-brand-navy">
                            {interaction.interactionType}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(interaction.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {interaction.loggedBy}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        {interaction.summary}
                      </p>
                      {interaction.outcome && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Outcome:</span>{" "}
                          {interaction.outcome}
                        </p>
                      )}
                      {interaction.nextFollowUpDate && (
                        <p className="text-xs text-brand-navy mt-1">
                          Follow-up:{" "}
                          {new Date(interaction.nextFollowUpDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Trail */}
          {contact.auditLogs?.length > 0 && (
            <div className="card">
              <button
                onClick={() => setShowAudit(!showAudit)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="font-semibold text-gray-900">
                  Change History ({contact.auditLogs.length})
                </h3>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showAudit ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {showAudit && (
                <div className="mt-4 space-y-2">
                  {contact.auditLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="text-xs text-gray-500 flex items-start gap-2 py-1"
                    >
                      <span className="text-gray-400 shrink-0">
                        {new Date(log.changedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>
                        <span className="font-medium text-gray-700">{log.field}</span>
                        {log.oldValue && (
                          <>
                            {" "}changed from{" "}
                            <span className="line-through text-gray-400">
                              {log.oldValue}
                            </span>
                          </>
                        )}
                        {" "}to{" "}
                        <span className="font-medium text-gray-700">{log.newValue}</span>
                        <span className="text-gray-400"> by {log.changedBy}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Contact" wide>
        <ContactForm
          contact={contact}
          onSaved={() => {
            setShowEdit(false);
            fetchContact();
          }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      {/* Interaction Modal */}
      <Modal
        open={showInteraction}
        onClose={() => setShowInteraction(false)}
        title="Log Interaction"
      >
        <InteractionForm
          contactId={id}
          onSaved={() => {
            setShowInteraction(false);
            fetchContact();
          }}
          onCancel={() => setShowInteraction(false)}
        />
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-gray-700 font-medium text-right">{value || "—"}</dd>
    </div>
  );
}
