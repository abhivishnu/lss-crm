import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  return <span className={`badge ${colors}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const colors = PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  return <span className={`badge border ${colors}`}>{priority}</span>;
}

export function OverdueBadge() {
  return (
    <span className="badge bg-red-100 text-red-700 border border-red-200">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      Overdue
    </span>
  );
}

export function UpcomingBadge() {
  return (
    <span className="badge bg-yellow-100 text-yellow-700 border border-yellow-200">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
      </svg>
      Soon
    </span>
  );
}

export function ActiveClientBadge() {
  return (
    <span className="badge bg-green-100 text-green-700 border border-green-200">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
      Active
    </span>
  );
}
