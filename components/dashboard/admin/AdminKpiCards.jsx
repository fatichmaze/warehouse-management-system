"use client";

import Link from "next/link";
import {
  Package,
  ArrowLeftRight,
  Wallet,
  Clock,
} from "lucide-react";

function formatRupiah(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export default function AdminKpiCards({
  totalProducts = 0,
  transactionsThisMonth = 0,
  inventoryValue = 0,
  pendingSupplierApprovals = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {/* KPI 1: Total Products */}
      <div className="rounded-[20px] bg-white border border-[#E8EEF4] p-4 shadow-[0_6px_18px_rgba(48,70,91,0.04)] flex flex-col justify-between min-h-31.5">
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DCEAF3]/75 text-[#527DA3] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-3.5">
          <p
            className="text-[25px] leading-tight font-bold text-[#527DA3]"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
          >
            {Number(totalProducts ?? 0).toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-[#8998A5] leading-snug">
            Total Products
          </p>
        </div>
      </div>

      {/* KPI 2: Transactions This Month */}
      <div className="rounded-[20px] bg-white border border-[#E8EEF4] p-4 shadow-[0_6px_18px_rgba(48,70,91,0.04)] flex flex-col justify-between min-h-31.5">
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DCEAF3]/75 text-[#527DA3] flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-3.5">
          <p
            className="text-[25px] leading-tight font-bold text-[#527DA3]"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
          >
            {Number(transactionsThisMonth ?? 0).toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-[#8998A5] leading-snug">
            Transaction This Month.
          </p>
        </div>
      </div>

      {/* KPI 3: Inventory Value */}
      <div className="rounded-[20px] bg-[#F7F0E4] border border-[#E8DCC8] p-4 shadow-[0_6px_18px_rgba(48,70,91,0.04)] flex flex-col justify-between min-h-31.5">
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8DCC8] text-[#30465B] flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-3.5">
          <p
            className="text-[22px] leading-tight font-bold text-[#30465B] truncate"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
            title={formatRupiah(inventoryValue)}
          >
            {formatRupiah(inventoryValue)}
          </p>
          <p className="mt-1 text-[11px] text-[#8998A5] leading-snug">
            Inventory Value
          </p>
        </div>
      </div>

      {/* KPI 4: Pending Supplier Approvals */}
      <Link
        href="/admin/suppliers"
        className="rounded-[20px] bg-[#2D4356] border border-[#2D4356] p-4 shadow-[0_8px_20px_rgba(45,67,86,0.16)] flex flex-col justify-between min-h-31.5 transition-opacity hover:opacity-95"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8DCC8] text-[#30465B] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-medium">
            Tinjau
          </span>
        </div>

        <div className="mt-3.5">
          <p
            className="text-[25px] leading-tight font-bold text-white"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
          >
            {Number(pendingSupplierApprovals ?? 0).toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-[#CBD7E2] leading-snug">
            Pending Supplier Approvals
          </p>
        </div>
      </Link>
    </div>
  );
}