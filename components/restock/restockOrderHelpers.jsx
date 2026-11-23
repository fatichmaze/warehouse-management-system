import { formatDateId } from "@/components/transactions/api";

export const STATUSES = [
  "Pending",
  "Confirmed",
  "Rejected",
  "In Transit",
  "Received",
];

export const STATUS_STYLES = {
  Pending: "bg-[#F7EFE3] text-[#8C5A1E]",
  Confirmed: "bg-[#DCEAF3] text-[#527DA3]",
  Rejected: "bg-[#FDECEC] text-[#C53030]",
  "In Transit": "bg-[#E8EEF8] text-[#30465B]",
  Received: "bg-[#EAF6EE] text-[#2F855A]",
};

export const fieldCls =
  "rounded-xl border border-[#DCE6EF] bg-white px-3.5 py-2.5 text-[12px] text-[#30465B] placeholder:text-[#8998A5] outline-none focus:border-[#527DA3]";

export function formatDate(value) {
  if (!value) return "-";
  return formatDateId(String(value).slice(0, 10));
}

export function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
        STATUS_STYLES[status] || "bg-[#F7F9FA] text-[#637587]"
      }`}
    >
      {status}
    </span>
  );
}