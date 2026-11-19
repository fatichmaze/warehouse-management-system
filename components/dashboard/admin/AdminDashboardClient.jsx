"use client";

import { useState } from "react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import AdminKpiCards from "@/components/dashboard/admin/AdminKpiCards";
import AdminSupplierApproval from "@/components/dashboard/admin/AdminSupplierApproval";
import AdminInventoryOverview from "@/components/dashboard/admin/AdminInventoryOverview";
import AdminStockAlerts from "@/components/dashboard/admin/AdminStockAlerts";
import AdminRecentTransactions from "@/components/dashboard/admin/AdminRecentTransactions";
import AdminRecentActivities from "@/components/dashboard/admin/AdminRecentActivities";

export default function AdminDashboardClient({
  adminName = "Admin Tataloka",
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
  const [pendingSuppliers, setPendingSuppliers] = useState(
    initialPendingSuppliers
  );
  const [pendingCount, setPendingCount] = useState(
    typeof initialKpi?.pendingSupplierApprovals === "number"
      ? initialKpi.pendingSupplierApprovals
      : initialPendingSuppliers.length
  );

  function handleSupplierListUpdated(updatedList) {
    setPendingSuppliers(updatedList);
    setPendingCount(updatedList.length);
  }

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar pendingCount={pendingCount} />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar adminName={adminName} />

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

                <p className="mt-2.5 text-[12px] leading-relaxed text-[#8998A5] max-w-[270px]">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 space-y-5">
                <AdminSupplierApproval
                  initialSuppliers={pendingSuppliers}
                  onStatusUpdated={handleSupplierListUpdated}
                />
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