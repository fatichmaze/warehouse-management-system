"use client";

import { ArrowLeftRight } from "lucide-react";

function formatTransactionDate(trx) {
  const rawDate = trx?.transaction_date || trx?.created_at;
  if (!rawDate) return "-";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getTypeBadge(type) {
  const normalized = String(type || "").trim().toLowerCase();
  if (normalized === "outgoing") {
    return {
      label: "Stock Out",
      className: "bg-[#F7EFE3] text-[#C4823B] border border-[#EED8B8]",
    };
  }
  if (normalized === "incoming") {
    return {
      label: "Stock In",
      className: "bg-[#DCEAF3] text-[#527DA3] border border-[#C6DCEB]",
    };
  }
  return {
    label: type || "-",
    className: "bg-[#F7F9FA] text-[#637587] border border-[#E8EEF4]",
  };
}

function getStatusBadge(status) {
  const normalized = String(status || "").trim().toLowerCase();
  switch (normalized) {
    case "approved":
      return {
        label: "Approved",
        className: "bg-[#EAF5EE] text-[#2B6E44] border border-[#C6E5D1]",
      };
    case "rejected":
      return {
        label: "Rejected",
        className: "bg-[#FDECEC] text-[#C94440] border border-[#F5C7C7]",
      };
    case "shipped":
      return {
        label: "Shipped",
        className: "bg-[#DCEAF3] text-[#30465B] border border-[#C2D8E8]",
      };
    case "pending":
    default:
      return {
        label: status || "Pending",
        className: "bg-[#F7EFE3] text-[#C4823B] border border-[#EED8B8]",
      };
  }
}

export default function AdminRecentTransactions({ transactions = [] }) {
  const list = Array.isArray(transactions) ? transactions : [];

  return (
    <section className="rounded-[22px] bg-white border border-[#E8EEF4] p-5 shadow-[0_6px_18px_rgba(48,70,91,0.04)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2
          className="text-[15px] font-bold text-[#30465B]"
          style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
        >
          Recent Transactions
        </h2>
      </div>

      {list.length === 0 ? (
        <div className="py-8 px-4 rounded-xl bg-[#F7F9FA] border border-dashed border-[#DCE6EF] flex flex-col items-center justify-center text-center">
          <ArrowLeftRight
            className="w-5 h-5 text-[#8998A5] mb-1.5"
            strokeWidth={1.8}
          />
          <p className="text-[12px] font-semibold text-[#30465B]">
            Belum ada transaksi tercatat
          </p>
          <p className="text-[11px] text-[#8998A5] mt-0.5">
            Data transaksi terbaru dari database akan muncul di bagian ini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F9FA] text-[#8998A5] text-[10.5px] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3 rounded-l-lg">TRANSACTION NO</th>
                <th className="py-2.5 px-3">TYPE</th>
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">USER</th>
                <th className="py-2.5 px-3 rounded-r-lg text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F7] text-[12px]">
              {list.map((trx) => {
                const typeBadge = getTypeBadge(trx.type);
                const statusBadge = getStatusBadge(trx.status);

                return (
                  <tr
                    key={trx.id}
                    className="hover:bg-[#F7F9FA]/70 transition-colors"
                  >
                    <td className="py-3 px-3 align-middle font-bold text-[#30465B] whitespace-nowrap">
                      {trx.transaction_number || "-"}
                    </td>
                    <td className="py-3 px-3 align-middle whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${typeBadge.className}`}
                      >
                        {typeBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 align-middle text-[#8998A5] text-[11.5px] whitespace-nowrap">
                      {formatTransactionDate(trx)}
                    </td>
                    <td className="py-3 px-3 align-middle text-[#30465B] font-medium whitespace-nowrap">
                      {trx.user_name || "-"}
                    </td>
                    <td className="py-3 px-3 align-middle text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}