"use client";

import { AlertTriangle, CheckCircle2, PackageX } from "lucide-react";

function getStatusBadgeStyle(status) {
  switch (status) {
    case "Out of Stock":
      return {
        badgeClass: "bg-[#F1F4F7] text-[#5C6F82] border border-[#DCE4EC]",
        Icon: PackageX,
      };
    case "Severe":
      return {
        badgeClass: "bg-[#FDECEC] text-[#C94440] border border-[#F5C7C7]",
        Icon: AlertTriangle,
      };
    case "Low":
      return {
        badgeClass: "bg-[#F7EFE3] text-[#C4823B] border border-[#EED8B8]",
        Icon: AlertTriangle,
      };
    default:
      return {
        badgeClass: "bg-[#F7F9FA] text-[#637587] border border-[#E8EEF4]",
        Icon: AlertTriangle,
      };
  }
}

function getRelevantThreshold(item) {
  if (item.stock_status === "Out of Stock") {
    return `0 (Min: ${Number(item.min_stock ?? 0).toLocaleString("id-ID")})`;
  }
  if (item.stock_status === "Severe") {
    return `≤ ${Number(item.min_stock ?? 0).toLocaleString("id-ID")} (Min)`;
  }
  if (item.stock_status === "Low") {
    return `≤ ${Number(item.low_stock ?? 0).toLocaleString("id-ID")} (Low)`;
  }
  return "-";
}

export default function AdminStockAlerts({ alerts = [] }) {
  const alertList = Array.isArray(alerts) ? alerts : [];
  const alertCount = alertList.length;

  return (
    <section className="rounded-[22px] bg-white border border-[#E8EEF4] p-5 shadow-[0_6px_18px_rgba(48,70,91,0.04)]">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <h2
            className="text-[14px] font-bold text-[#30465B]"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
          >
            Stock Alerts
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-[#FDECEC] text-[#C94440] text-[10.5px] font-semibold tabular-nums">
            {alertCount.toLocaleString("id-ID")} produk
          </span>
        </div>
      </div>

      {alertCount === 0 ? (
        <div className="py-7 px-4 rounded-xl bg-[#F7F9FA] border border-dashed border-[#DCE6EF] flex flex-col items-center justify-center text-center">
          <CheckCircle2
            className="w-5 h-5 text-[#527DA3] mb-1.5"
            strokeWidth={1.8}
          />
          <p className="text-[12px] font-semibold text-[#30465B]">
            Semua stok produk dalam kondisi normal
          </p>
          <p className="text-[11px] text-[#8998A5] mt-0.5">
            Tidak ada produk dengan status Low, Severe, maupun Out of Stock.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#EEF3F7]">
          {alertList.map((item) => {
            const styleMeta = getStatusBadgeStyle(item.stock_status);
            const StatusIcon = styleMeta.Icon;

            return (
              <div
                key={item.id}
                className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#30465B] truncate">
                    {item.name || "-"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap text-[10.5px] text-[#8998A5] mt-0.5">
                    <span>{item.sku || "-"}</span>
                    <span>•</span>
                    <span className="font-medium text-[#5C6F82]">
                      Stok: {Number(item.current_stock ?? 0).toLocaleString("id-ID")}
                    </span>
                    <span>•</span>
                    <span>Batas: {getRelevantThreshold(item)}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold whitespace-nowrap shrink-0 ${styleMeta.badgeClass}`}
                >
                  <StatusIcon className="w-3 h-3 shrink-0" strokeWidth={2} />
                  <span>{item.stock_status}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}