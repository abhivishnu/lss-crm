"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/Badge";

interface DashboardData {
  statusCounts: { status: string; count: number }[];
  sourceCounts: { source: string; count: number }[];
  wonBySource: { source: string; count: number }[];
  totalContacts: number;
  activeClients: number;
  overdueFollowUps: number;
  followUpsDueToday: number;
  newLeadsThisMonth: number;
  pipelineCount: number;
  conversionRate: string;
  recentInteractions: any[];
  upcomingFollowUps: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
      </div>
    );
  }

  if (!data) return <p className="text-red-500">Failed to load dashboard.</p>;

  const statCards = [
    {
      label: "Total Contacts",
      value: data.totalContacts,
      color: "text-brand-navy",
      bg: "bg-brand-navy/5",
    },
    {
      label: "In Pipeline",
      value: data.pipelineCount,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Clients",
      value: data.activeClients,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Conversion Rate",
      value: `${data.conversionRate}%`,
      color: "text-brand-gold-dark",
      bg: "bg-amber-50",
    },
    {
      label: "New This Month",
      value: data.newLeadsThisMonth,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Overdue Follow-Ups",
      value: data.overdueFollowUps,
      color: data.overdueFollowUps > 0 ? "text-red-600" : "text-gray-600",
      bg: data.overdueFollowUps > 0 ? "bg-red-50" : "bg-gray-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your pipeline and client activity
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`card !p-4 ${stat.bg}`}>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Follow-Ups */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Upcoming Follow-Ups
            </h2>
            <Link href="/pipeline" className="text-sm text-brand-navy hover:underline">
              View pipeline
            </Link>
          </div>
          {data.upcomingFollowUps.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No upcoming follow-ups
            </p>
          ) : (
            <div className="space-y-3">
              {data.upcomingFollowUps.map((contact: any) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-1"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-gray-900">
                      {contact.primaryFirstName} {contact.primaryLastName}
                      {contact.studentName && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          ({contact.studentName})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {contact.nextStep || "No next step set"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <PriorityBadge priority={contact.priorityScore} />
                    <span className="text-xs text-gray-500">
                      {new Date(contact.nextFollowUpDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {data.recentInteractions.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No recent interactions
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentInteractions.map((interaction: any) => (
                <div
                  key={interaction.id}
                  className="flex gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0">
                    <InteractionIcon type={interaction.interactionType} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {interaction.contact.primaryFirstName}{" "}
                        {interaction.contact.primaryLastName}
                      </span>
                      <span className="text-gray-400 mx-1.5">&middot;</span>
                      <span className="text-gray-500">
                        {interaction.interactionType}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {interaction.summary}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(interaction.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">
            Contacts by Status
          </h2>
          <div className="space-y-2">
            {data.statusCounts.map(({ status, count }) => {
              const maxCount = Math.max(
                ...data.statusCounts.map((s) => s.count)
              );
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-36 shrink-0">
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-brand-navy rounded-full h-2 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Source Performance */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">
            Lead Source Performance
          </h2>
          <div className="space-y-2">
            {data.sourceCounts
              .filter((s) => s.source)
              .map(({ source, count }) => {
                const won =
                  data.wonBySource.find((w) => w.source === source)?.count || 0;
                const maxCount = Math.max(
                  ...data.sourceCounts.map((s) => s.count)
                );
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={source} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-gray-700 shrink-0">
                      {source}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-brand-gold rounded-full h-2 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700 w-16 text-right">
                      {count}{" "}
                      <span className="text-gray-400">
                        ({won} won)
                      </span>
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractionIcon({ type }: { type: string }) {
  const className = "w-4 h-4 text-brand-navy/60";
  switch (type) {
    case "Call":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      );
    case "Email":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "Meeting":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
  }
}
