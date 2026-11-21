"use client";

import { useState } from "react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import AdminSupplierApproval from "@/components/dashboard/admin/AdminSupplierApproval";

export default function AdminSuppliersClient({
  adminName = "Admin Tataloka",
  initialPendingSuppliers = [],
}) {
  const safeInitialSuppliers = Array.isArray(initialPendingSuppliers)
    ? initialPendingSuppliers
    : [];

  const [pendingSuppliers, setPendingSuppliers] =
    useState(safeInitialSuppliers);
  const [pendingCount, setPendingCount] = useState(
    safeInitialSuppliers.length
  );

  function handleSupplierListUpdated(updatedList) {
    const nextList = Array.isArray(updatedList) ? updatedList : [];
    setPendingSuppliers(nextList);
    setPendingCount(nextList.length);
  }

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar pendingCount={pendingCount} />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar
            adminName={adminName}
            currentSection="Supplier Verification"
          />

          <main className="flex-1 px-7 pt-3 pb-7 space-y-5">
            <div className="pt-1">
              <h1
                className="text-[34px] leading-[1.08] font-bold tracking-tight"
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                <span className="text-[#30465B] block">Supplier</span>
                <span className="text-[#527DA3] block">Verification</span>
              </h1>

              <p className="mt-2.5 text-[12px] leading-relaxed text-[#8998A5] max-w-67.5">
                Tinjau dan proses pendaftaran akun supplier yang menunggu
                persetujuan.
              </p>
            </div>

            <AdminSupplierApproval
              initialSuppliers={pendingSuppliers}
              onStatusUpdated={handleSupplierListUpdated}
              showViewAllLink={false}
            />
          </main>
        </div>
      </div>
    </div>
  );
}