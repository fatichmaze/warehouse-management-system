"use client";

import {
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  XCircle,
} from "lucide-react";

export default function ProductSummaryCards({ summary }) {
  const totalProducts = Number(summary?.totalProducts ?? 0);
  const normal = Number(summary?.normal ?? 0);
  const lowStock = Number(summary?.lowStock ?? 0);
  const severe = Number(summary?.severe ?? 0);
  const outOfStock = Number(summary?.outOfStock ?? 0);

  const cards = [
    {
      key: "total",
      label: "Total Products",
      value: totalProducts,
      badge: "Semua",
      icon: Package,
      variant: "light",
      iconBg: "bg-[#EEF4F9] text-[#527DA3]",
      badgeClass: "bg-[#EEF4F9] text-[#527DA3]",
    },
    {
      key: "normal",
      label: "Normal",
      value: normal,
      badge: "Aman",
      icon: CheckCircle2,
      variant: "light",
      iconBg: "bg-[#EAF6EE] text-[#2F855A]",
      badgeClass: "bg-[#EAF6EE] text-[#2F855A]",
    },
    {
      key: "low",
      label: "Low Stock",
      value: lowStock,
      badge: "Pantau",
      icon: AlertTriangle,
      variant: "light",
      iconBg: "bg-[#FEF5E7] text-[#D9822B]",
      badgeClass: "bg-[#FEF5E7] text-[#D9822B]",
    },
    {
      key: "severe",
      label: "Severe",
      value: severe,
      badge: "Kritis",
      icon: AlertOctagon,
      variant: "light",
      iconBg: "bg-[#FDECEC] text-[#C53030]",
      badgeClass: "bg-[#FDECEC] text-[#C53030]",
    },
    {
      key: "out",
      label: "Out of Stock",
      value: outOfStock,
      badge: "Restock",
      icon: XCircle,
      variant: "dark",
      iconBg: "bg-white/12 text-white",
      badgeClass: "bg-white/12 text-[#E2EBF2]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isDark = card.variant === "dark";

        return (
          <div
            key={card.key}
            className={
              isDark
                ? "rounded-2xl bg-[#2D4356] text-white p-4 border border-[#2D4356] shadow-[0_8px_20px_rgba(45,67,86,0.16)] flex flex-col justify-between min-h-29.5"
                : "rounded-2xl bg-white text-[#30465B] p-4 border border-[#E8EEF4] shadow-[0_2px_10px_rgba(48,70,91,0.04)] flex flex-col justify-between min-h-29.5"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.9} />
              </span>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold leading-tight ${card.badgeClass}`}
              >
                {card.badge}
              </span>
            </div>

            <div className="mt-3">
              <div
                className={`text-[28px] leading-[1.1] font-bold tracking-tight ${
                  isDark ? "text-white" : "text-[#30465B]"
                }`}
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                {card.value.toLocaleString("id-ID")}
              </div>
              <p
                className={`mt-1 text-[12px] font-medium leading-snug ${
                  isDark ? "text-[#CBD7E2]" : "text-[#8998A5]"
                }`}
              >
                {card.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
