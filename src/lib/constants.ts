export const CONTACT_TYPES = ["Parent", "Student", "Partner", "Other"] as const;

export const LEAD_STATUSES = [
  "New Lead",
  "Contacted",
  "Discovery Scheduled",
  "Discovery Completed",
  "Proposal Sent",
  "Decision Pending",
  "Won – Active Client",
  "Nurture",
  "Lost",
  "Do Not Contact",
] as const;

export const PIPELINE_STATUSES = [
  "New Lead",
  "Contacted",
  "Discovery Scheduled",
  "Discovery Completed",
  "Proposal Sent",
  "Decision Pending",
  "Nurture",
] as const;

export const LEAD_SOURCES = [
  "Referral",
  "Workshop",
  "School Partner",
  "Instagram",
  "Google",
  "Past Client",
  "Other",
] as const;

export const SERVICE_INTERESTS = [
  "Academic Planning",
  "Essays",
  "Apps",
  "Test Planning",
  "Scholarships",
  "Comprehensive",
] as const;

export const BUDGET_FITS = ["High", "Medium", "Low", "Unknown"] as const;

export const PRIORITY_SCORES = ["Hot", "Warm", "Cold"] as const;

export const PREFERRED_CONTACT_METHODS = ["Email", "Text", "Call"] as const;

export const INTERACTION_TYPES = [
  "Call",
  "Email",
  "Text",
  "Meeting",
  "Workshop",
  "DM",
] as const;

export const CLIENT_STATUSES = ["Active", "Paused", "Completed"] as const;

export const PAYMENT_STATUSES = [
  "Not invoiced",
  "Invoiced",
  "Paid",
  "Partial",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  "New Lead": "bg-blue-100 text-blue-800",
  Contacted: "bg-indigo-100 text-indigo-800",
  "Discovery Scheduled": "bg-yellow-100 text-yellow-800",
  "Discovery Completed": "bg-orange-100 text-orange-800",
  "Proposal Sent": "bg-purple-100 text-purple-800",
  "Decision Pending": "bg-pink-100 text-pink-800",
  "Won – Active Client": "bg-green-100 text-green-800",
  Nurture: "bg-teal-100 text-teal-800",
  Lost: "bg-red-100 text-red-800",
  "Do Not Contact": "bg-gray-200 text-gray-500",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Hot: "bg-red-100 text-red-700 border-red-200",
  Warm: "bg-orange-100 text-orange-700 border-orange-200",
  Cold: "bg-blue-100 text-blue-700 border-blue-200",
};
