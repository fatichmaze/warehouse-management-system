"use client";

import { Activity, ArrowDownToLine, ArrowUpFromLine, UserCheck } from "lucide-react";

function formatActivityTime(rawDate) {
  if (!rawDate) return "-";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getActivityVisual(activity) {
  if (activity?.kind === "supplier") {
    return {
      Icon: UserCheck,
      badgeClass: "bg-[#F7EFE3] text-[#C4823B] border border-[#EED8B8]",
    };
  }

  const trxType = String(activity?.trx_type || "").trim().toLowerCase();
  if (trxType === "outgoing") {
    return {
      Icon: ArrowUpFromLine,
      badgeClass: "bg-[#FDECEC] text-[#C94440] border border-[#F5C7C7]",
    };
  }

  return {
    Icon: ArrowDownToLine,
    badgeClass: "bg-[#DCEAF3] text-[#527DA3] border border-[#C6DCEB]",
  };
}

export default function AdminRecentActivities({ activities = [] }) {
  const list = Array.isArray(activities) ? activities : [];

  return (
    <section className="rounded-[22px] bg-white border border-[#E8EEF4] p-5 shadow-[0_6px_18px_rgba(48,70,91,0.04)]">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <h2
          className="text-[15px] font-bold text-[#30465B]"
          style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
        >
          Recent Activities
        </h2>
      </div>

      {list.length === 0 ? (
        <div className="py-8 px-4 rounded-xl bg-[#F7F9FA] border border-dashed border-[#DCE6EF] flex flex-col items-center justify-center text-center">
          <Activity
            className="w-5 h-5 text-[#8998A5] mb-1.5"
            strokeWidth={1.8}
          />
          <p className="text-[12px] font-semibold text-[#30465B]">
            Belum ada aktivitas tercatat
          </p>
          <p className="text-[11px] text-[#8998A5] mt-0.5">
            Aktivitas transaksi dan pendaftaran supplier akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#EEF3F7]">
          {list.map((item) => {
            const { Icon, badgeClass } = getActivityVisual(item);

            return (
              <div
                key={item.id}
                className="py-3 first:pt-1 last:pb-1 flex items-start gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${badgeClass}`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.9} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-[#30465B] leading-snug">
                    {item.title || "-"}
                  </p>
                  <p className="text-[11px] text-[#8998A5] mt-0.5 leading-snug">
                    {item.subtitle || "-"}
                  </p>
                  <p className="text-[10.5px] text-[#8998A5] mt-1">
                    {formatActivityTime(item.occurred_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}