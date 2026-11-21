const STYLES = {
  Pending: "bg-[#FEF5E7] text-[#D9822B]",
  Approved: "bg-[#EAF6EE] text-[#2F855A]",
  Rejected: "bg-[#FDECEC] text-[#C53030]",
  Shipped: "bg-[#E6F0F8] text-[#527DA3]",
};

export default function TransactionStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        STYLES[status] ?? "bg-[#F7F9FA] text-[#637587]"
      }`}
    >
      {status}
    </span>
  );
}
