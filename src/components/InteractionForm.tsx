"use client";

import { useState } from "react";
import { INTERACTION_TYPES } from "@/lib/constants";
import toast from "react-hot-toast";

interface InteractionFormProps {
  contactId: string;
  onSaved: () => void;
  onCancel: () => void;
}

export default function InteractionForm({
  contactId,
  onSaved,
  onCancel,
}: InteractionFormProps) {
  const [form, setForm] = useState({
    interactionType: "Call",
    summary: "",
    outcome: "",
    date: new Date().toISOString().split("T")[0],
    nextFollowUpDate: "",
  });
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.summary.trim()) {
      toast.error("Summary is required");
      return;
    }

    setLoading(true);
    try {
      const body: any = {
        contactId,
        interactionType: form.interactionType,
        summary: form.summary,
        outcome: form.outcome || undefined,
        date: form.date || undefined,
      };
      if (form.nextFollowUpDate) {
        body.nextFollowUpDate = form.nextFollowUpDate;
      }

      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to log interaction");
      }

      toast.success("Interaction logged");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <select
            className="select"
            value={form.interactionType}
            onChange={(e) => set("interactionType", e.target.value)}
          >
            {INTERACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Summary *</label>
        <textarea
          className="input min-h-[70px]"
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          placeholder="Brief summary of the interaction..."
          rows={2}
          required
        />
      </div>

      <div>
        <label className="label">Outcome</label>
        <input
          className="input"
          value={form.outcome}
          onChange={(e) => set("outcome", e.target.value)}
          placeholder="Result or next action from this interaction"
        />
      </div>

      <div>
        <label className="label">Set Next Follow-Up</label>
        <input
          className="input"
          type="date"
          value={form.nextFollowUpDate}
          onChange={(e) => set("nextFollowUpDate", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : "Log Interaction"}
        </button>
      </div>
    </form>
  );
}
