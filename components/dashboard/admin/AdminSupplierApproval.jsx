"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";

function formatRegisteredDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminSupplierApproval({
  initialSuppliers = [],
  onStatusUpdated,
  showViewAllLink = true,
}) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [processingId, setProcessingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDecision(supplierId, action) {
    if (processingId) return;

    setProcessingId(supplierId);
    setFeedbackMessage("");
    setErrorMessage("");

    try {
      const res = await fetch(
        `/api/admin/suppliers/${supplierId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Gagal memproses supplier.");
        return;
      }

      const nextList = suppliers.filter(
        (item) => item.id !== supplierId
      );

      setSuppliers(nextList);
      setFeedbackMessage(data.message || "Status supplier berhasil diperbarui.");

      if (typeof onStatusUpdated === "function") {
        onStatusUpdated(nextList, action);
      }
    } catch (error) {
      console.error("Supplier approval error:", error);
      setErrorMessage("Terjadi kesalahan jaringan.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section
      id="supplier-approval"
      className="rounded-[22px] bg-white border border-[#E8EEF4] p-5 shadow-[0_6px_18px_rgba(48,70,91,0.04)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2
            className="text-[15px] font-bold text-[#30465B]"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
          >
            Supplier Approval
          </h2>

          <span className="px-2.5 py-0.5 rounded-full bg-[#F7EFE3] text-[#C4823B] text-[11px] font-semibold">
            {suppliers.length} menunggu
          </span>
        </div>

        {showViewAllLink && (
          <Link
            href="/admin/dashboard#supplier-approval"
            className="text-[11.5px] font-medium text-[#527DA3] hover:underline shrink-0"
          >
            Lihat semua
          </Link>
        )}
      </div>

      {feedbackMessage && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-[#EAF5EE] text-[#2B6E44] text-[11.5px] font-medium">
          {feedbackMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-[#FDECEC] text-[#B43232] text-[11.5px] font-medium">
          {errorMessage}
        </div>
      )}

      {suppliers.length === 0 ? (
        <div className="py-10 text-center rounded-xl bg-[#F7F9FA] border border-dashed border-[#DCE6EF]">
          <p className="text-[12.5px] font-medium text-[#637587]">
            Tidak ada pendaftaran supplier yang menunggu persetujuan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F9FA] text-[#8998A5] text-[10.5px] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3 rounded-l-lg">SUPPLIER</th>
                <th className="py-2.5 px-3">COMPANY</th>
                <th className="py-2.5 px-3">REGISTERED</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 rounded-r-lg text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEF3F7] text-[12px]">
              {suppliers.map((supplier) => {
                const isBusy = processingId === supplier.id;

                return (
                  <tr
                    key={supplier.id}
                    className="hover:bg-[#F7F9FA]/70 transition-colors"
                  >
                    <td className="py-3 px-3 align-middle">
                      <p className="font-semibold text-[#30465B] leading-snug">
                        {supplier.name || "-"}
                      </p>
                      <p className="text-[11px] text-[#8998A5] leading-snug">
                        {supplier.email || "-"}
                      </p>
                    </td>

                    <td className="py-3 px-3 align-middle text-[#5C6F82] font-medium">
                      {supplier.company_name || "-"}
                    </td>

                    <td className="py-3 px-3 align-middle text-[#8998A5] text-[11.5px] whitespace-nowrap">
                      {formatRegisteredDate(supplier.created_at)}
                    </td>

                    <td className="py-3 px-3 align-middle whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F7EFE3] text-[#C4823B] text-[11px] font-semibold">
                        Pending
                      </span>
                    </td>

                    <td className="py-3 px-3 align-middle whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleDecision(supplier.id, "approve")
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2D4356] hover:bg-[#527DA3] disabled:opacity-50 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" strokeWidth={2.2} />
                          <span>{isBusy ? "..." : "Approve"}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleDecision(supplier.id, "reject")
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#FDECEC] disabled:opacity-50 text-[#B43232] border border-[#F3C8C8] text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" strokeWidth={2.2} />
                          <span>Reject</span>
                        </button>
                      </div>
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