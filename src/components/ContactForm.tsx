"use client";

import { useState } from "react";
import {
  CONTACT_TYPES,
  LEAD_STATUSES,
  LEAD_SOURCES,
  SERVICE_INTERESTS,
  BUDGET_FITS,
  PRIORITY_SCORES,
  PREFERRED_CONTACT_METHODS,
  CLIENT_STATUSES,
  PAYMENT_STATUSES,
} from "@/lib/constants";
import toast from "react-hot-toast";

interface ContactFormProps {
  contact?: any;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ContactForm({ contact, onSaved, onCancel }: ContactFormProps) {
  const isEdit = !!contact;
  const [form, setForm] = useState({
    contactType: contact?.contactType || "Parent",
    primaryFirstName: contact?.primaryFirstName || "",
    primaryLastName: contact?.primaryLastName || "",
    studentName: contact?.studentName || "",
    studentGradYear: contact?.studentGradYear || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    preferredContactMethod: contact?.preferredContactMethod || "Email",
    city: contact?.city || "",
    state: contact?.state || "TX",
    schoolName: contact?.schoolName || "",
    notesStatic: contact?.notesStatic || "",
    leadSource: contact?.leadSource || "Other",
    referredBy: contact?.referredBy || "",
    serviceInterest: contact?.serviceInterest || "",
    budgetFit: contact?.budgetFit || "Unknown",
    priorityScore: contact?.priorityScore || "Cold",
    leadStatus: contact?.leadStatus || "New Lead",
    statusReason: contact?.statusReason || "",
    nextFollowUpDate: contact?.nextFollowUpDate
      ? new Date(contact.nextFollowUpDate).toISOString().split("T")[0]
      : "",
    nextStep: contact?.nextStep || "",
    packageInterestedIn: contact?.packageInterestedIn || "",
    packagePurchased: contact?.packagePurchased || "",
    startDate: contact?.startDate
      ? new Date(contact.startDate).toISOString().split("T")[0]
      : "",
    endDate: contact?.endDate
      ? new Date(contact.endDate).toISOString().split("T")[0]
      : "",
    clientStatus: contact?.clientStatus || "",
    paymentStatus: contact?.paymentStatus || "Not invoiced",
    contractSent: contact?.contractSent || false,
    contractSigned: contact?.contractSigned || false,
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(isEdit);

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.primaryFirstName || !form.primaryLastName) {
      toast.error("First and last name are required");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/contacts/${contact.id}` : "/api/contacts";
      const method = isEdit ? "PATCH" : "POST";

      const body: any = { ...form };
      if (!body.nextFollowUpDate) delete body.nextFollowUpDate;
      if (!body.startDate) delete body.startDate;
      if (!body.endDate) delete body.endDate;
      if (!body.clientStatus) delete body.clientStatus;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast.success(isEdit ? "Contact updated" : "Contact created");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Contact Type</label>
          <select className="select" value={form.contactType} onChange={(e) => set("contactType", e.target.value)}>
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="select" value={form.priorityScore} onChange={(e) => set("priorityScore", e.target.value)}>
            {PRIORITY_SCORES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First Name *</label>
          <input className="input" value={form.primaryFirstName} onChange={(e) => set("primaryFirstName", e.target.value)} required />
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input className="input" value={form.primaryLastName} onChange={(e) => set("primaryLastName", e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Student Name</label>
          <input className="input" value={form.studentName} onChange={(e) => set("studentName", e.target.value)} placeholder="If parent is primary" />
        </div>
        <div>
          <label className="label">Grad Year</label>
          <input className="input" value={form.studentGradYear} onChange={(e) => set("studentGradYear", e.target.value)} placeholder="2026" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="512-555-0000" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Preferred Contact</label>
          <select className="select" value={form.preferredContactMethod} onChange={(e) => set("preferredContactMethod", e.target.value)}>
            {PREFERRED_CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className="label">State</label>
          <input className="input" value={form.state} onChange={(e) => set("state", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">School Name</label>
        <input className="input" value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
      </div>

      {/* Pipeline */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pipeline</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Lead Status</label>
            <select className="select" value={form.leadStatus} onChange={(e) => set("leadStatus", e.target.value)}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Lead Source</label>
            <select className="select" value={form.leadSource} onChange={(e) => set("leadSource", e.target.value)}>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="label">Service Interest</label>
            <select className="select" value={form.serviceInterest} onChange={(e) => set("serviceInterest", e.target.value)}>
              <option value="">Select...</option>
              {SERVICE_INTERESTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Budget Fit</label>
            <select className="select" value={form.budgetFit} onChange={(e) => set("budgetFit", e.target.value)}>
              {BUDGET_FITS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="label">Referred By</label>
            <input className="input" value={form.referredBy} onChange={(e) => set("referredBy", e.target.value)} />
          </div>
          <div>
            <label className="label">Status Reason</label>
            <input className="input" value={form.statusReason} onChange={(e) => set("statusReason", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="label">Next Follow-Up</label>
            <input className="input" type="date" value={form.nextFollowUpDate} onChange={(e) => set("nextFollowUpDate", e.target.value)} />
          </div>
          <div>
            <label className="label">Next Step</label>
            <input className="input" value={form.nextStep} onChange={(e) => set("nextStep", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Advanced / Client Fields */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-brand-navy font-medium hover:underline"
        >
          {showAdvanced ? "Hide" : "Show"} Client & Onboarding Fields
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Package Interested In</label>
                <input className="input" value={form.packageInterestedIn} onChange={(e) => set("packageInterestedIn", e.target.value)} />
              </div>
              <div>
                <label className="label">Package Purchased</label>
                <input className="input" value={form.packagePurchased} onChange={(e) => set("packagePurchased", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Client Status</label>
                <select className="select" value={form.clientStatus} onChange={(e) => set("clientStatus", e.target.value)}>
                  <option value="">N/A</option>
                  {CLIENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input className="input" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div>
                <label className="label">End Date</label>
                <input className="input" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Payment Status</label>
                <select className="select" value={form.paymentStatus} onChange={(e) => set("paymentStatus", e.target.value)}>
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.contractSent} onChange={(e) => set("contractSent", e.target.checked)} className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy" />
                  Contract Sent
                </label>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.contractSigned} onChange={(e) => set("contractSigned", e.target.checked)} className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy" />
                  Contract Signed
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[80px]" value={form.notesStatic} onChange={(e) => set("notesStatic", e.target.value)} rows={3} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : isEdit ? "Update Contact" : "Add Contact"}
        </button>
      </div>
    </form>
  );
}
