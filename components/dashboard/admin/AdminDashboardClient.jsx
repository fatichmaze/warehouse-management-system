"use client";

import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import AdminKpiCards from "@/components/dashboard/admin/AdminKpiCards";
import AdminInventoryOverview from "@/components/dashboard/admin/AdminInventoryOverview";
import AdminStockAlerts from "@/components/dashboard/admin/AdminStockAlerts";
import AdminRecentTransactions from "@/components/dashboard/admin/AdminRecentTransactions";
import AdminRecentActivities from "@/components/dashboard/admin/AdminRecentActivities";

export default function AdminDashboardClient({
  adminName = "Admin Tataloka",
  userRole = "",
  initialKpi,
  initialPendingSuppliers = [],
  initialInventoryOverview = {
    totalProducts: 0,
    normal: 0,
    low: 0,
    severe: 0,
    outOfStock: 0,
  },
  initialStockAlerts = [],
  initialRecentTransactions = [],
  initialRecentActivities = [],
}) {
  const safePendingSuppliers = Array.isArray(initialPendingSuppliers)
    ? initialPendingSuppliers
    : [];
  const initialCount =
    typeof initialKpi?.pendingSupplierApprovals === "number"
      ? initialKpi.pendingSupplierApprovals
      : safePendingSuppliers.length;

  const pendingCount = initialCount;

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar pendingCount={pendingCount} role={userRole} />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar adminName={adminName} role={userRole} />

          <main className="flex-1 px-7 pt-3 pb-7 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-4 pt-1">
                <h1
                  className="text-[34px] leading-[1.08] font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  <span className="text-[#30465B] block">Dashboard</span>
                  <span className="text-[#527DA3] block">Overview</span>
                </h1>

                <p className="mt-2.5 text-[12px] leading-relaxed text-[#8998A5] max-w-67.5">
                  Pantau dan kelola seluruh aktivitas sistem gudang Anda.
                </p>
              </div>

              <div className="lg:col-span-8">
                <AdminKpiCards
                  totalProducts={initialKpi?.totalProducts ?? 0}
                  transactionsThisMonth={initialKpi?.transactionsThisMonth ?? 0}
                  inventoryValue={initialKpi?.inventoryValue ?? 0}
                  pendingSupplierApprovals={pendingCount}
                />
              </div>
            </div>

            {pendingCount > 0 && (
              <div
                role="status"
                className="rounded-[20px] bg-[#F7FAFC] border border-[#DCE6EF] px-5 py-3.5 shadow-[0_4px_14px_rgba(48,70,91,0.04)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#DCEAF3] text-[#527DA3] flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" strokeWidth={1.9} />
                  </div>

                  <p className="text-[12.5px] font-medium text-[#30465B]">
                    Ada{" "}
                    <span className="font-bold text-[#527DA3]">
                      {pendingCount}
                    </span>{" "}
                    pendaftaran supplier yang menunggu persetujuan.
                  </p>
                </div>

                <Link
                  href="/admin/suppliers"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#527DA3] hover:bg-[#2D4356] text-white text-[12px] font-semibold transition-colors shrink-0"
                >
                  <span>Lihat Supplier</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 space-y-5">
                <AdminRecentTransactions
                  transactions={initialRecentTransactions}
                />
              </div>
              <div className="lg:col-span-5 space-y-5">
                <AdminInventoryOverview
                  inventoryOverview={initialInventoryOverview}
                />
                <AdminStockAlerts alerts={initialStockAlerts} />
                <AdminRecentActivities activities={initialRecentActivities} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}