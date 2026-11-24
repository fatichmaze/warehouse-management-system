"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, Loader2 } from "lucide-react";

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

  const [rejectingSupplier, setRejectingSupplier] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  const isAnyProcessing = processingId !== null;
  const isRejectModalOpen = rejectingSupplier !== null;
  const isCurrentRejectProcessing =
    rejectingSupplier !== null && processingId === rejectingSupplier.id;
  const trimmedRejectionReason = rejectionReason.trim();
  const isReasonValid = trimmedRejectionReason.length > 0;

  useEffect(() => {
    if (!isRejectModalOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isAnyProcessing) {
        setRejectingSupplier(null);
        setRejectionReason("");
        setModalErrorMessage("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRejectModalOpen, isAnyProcessing]);

  function handleOpenRejectModal(supplier) {
    if (isAnyProcessing || !supplier) return;
    setFeedbackMessage("");
    setErrorMessage("");
    setModalErrorMessage("");
    setRejectionReason("");
    setRejectingSupplier(supplier);
  }

  function handleCloseRejectModal() {
    if (isAnyProcessing) return;
    setRejectingSupplier(null);
    setRejectionReason("");
    setModalErrorMessage("");
  }

  async function submitStatusDecision(supplierId, payload) {
    if (isAnyProcessing) return false;

    setProcessingId(supplierId);
    setFeedbackMessage("");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.message || "Gagal memproses supplier.";
        setErrorMessage(message);
        if (payload.action === "reject") {
          setModalErrorMessage(message);
        }
        return false;
      }

      const nextList = suppliers.filter((item) => item.id !== supplierId);

      setSuppliers(nextList);
      setFeedbackMessage(data.message || "Status supplier berhasil diperbarui.");

      if (typeof onStatusUpdated === "function") {
        onStatusUpdated(nextList, payload.action);
      }

      return true;
    } catch (error) {
      console.error("Supplier approval error:", error);
      const message = "Terjadi kesalahan jaringan.";
      setErrorMessage(message);
      if (payload.action === "reject") {
        setModalErrorMessage(message);
      }
      return false;
    } finally {
      setProcessingId(null);
    }
  }

  async function handleApprove(supplierId) {
    await submitStatusDecision(supplierId, { action: "approve" });
  }

  async function handleConfirmReject(e) {
    e?.preventDefault?.();
    if (!rejectingSupplier || isAnyProcessing) return;

    const cleanReason = rejectionReason.trim();
    if (!cleanReason) {
      const message = "Alasan penolakan wajib diisi dan tidak boleh hanya spasi.";
      setModalErrorMessage(message);
      setErrorMessage(message);
      return;
    }

    setModalErrorMessage("");

    const isSuccess = await submitStatusDecision(rejectingSupplier.id, {
      action: "reject",
      rejection_reason: cleanReason,
    });

    if (isSuccess) {
      setRejectingSupplier(null);
      setRejectionReason("");
      setModalErrorMessage("");
    }
  }

  return (
    <>
      <section
        id="supplier-approval"
        className="min-w-0 rounded-[22px] bg-white border border-[#E8EEF4] p-4 sm:p-5 shadow-[0_6px_18px_rgba(48,70,91,0.04)]"
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
            <table className="w-full min-w-160 text-left border-collapse">
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
                            disabled={isAnyProcessing}
                            onClick={() => handleApprove(supplier.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 sm:py-1 rounded-full bg-[#2D4356] hover:bg-[#527DA3] disabled:opacity-50 text-white text-[11.5px] sm:text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" strokeWidth={2.2} />
                            <span>{isBusy ? "..." : "Approve"}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isAnyProcessing}
                            onClick={() => handleOpenRejectModal(supplier)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 sm:py-1 rounded-full bg-white hover:bg-[#FDECEC] disabled:opacity-50 text-[#B43232] border border-[#F3C8C8] text-[11.5px] sm:text-[11px] font-semibold transition-colors cursor-pointer"
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

      {isRejectModalOpen && (
        <div
          onClick={handleCloseRejectModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2D3C]/45 backdrop-blur-[2px] p-3 sm:p-5 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-supplier-modal-title"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white border border-[#E8EEF4] shadow-[0_20px_48px_rgba(48,70,91,0.18)] overflow-hidden my-auto"
          >
            <div className="px-4 sm:px-6 py-4 border-b border-[#E8EEF4] bg-[#FAFBFD] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3
                  id="reject-supplier-modal-title"
                  className="text-[17px] sm:text-[18px] font-bold text-[#30465B] leading-tight"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Tolak Pendaftaran Supplier
                </h3>
                <p className="mt-1 text-[11.5px] sm:text-[12px] text-[#8998A5] leading-snug">
                  Berikan alasan penolakan yang jelas sebelum menolak akun supplier ini.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseRejectModal}
                disabled={isAnyProcessing}
                aria-label="Tutup modal penolakan"
                className="w-8 h-8 rounded-xl border border-[#E2E8F0] bg-white text-[#637587] hover:text-[#30465B] hover:bg-[#F7F9FA] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} noValidate>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="rounded-xl bg-[#F7F9FA] border border-[#E8EEF4] p-3.5 space-y-1.5 text-[12px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[#8998A5] shrink-0">Nama Supplier</span>
                    <span className="font-semibold text-[#30465B] text-right wrap-break-word">
                      {rejectingSupplier.name || "-"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[#8998A5] shrink-0">Email</span>
                    <span className="font-medium text-[#527DA3] text-right break-all">
                      {rejectingSupplier.email || "-"}
                    </span>
                  </div>
                </div>

                {modalErrorMessage && (
                  <div
                    role="alert"
                    className="px-3 py-2 rounded-xl bg-[#FDECEC] border border-[#F5C2C2] text-[#B43232] text-[11.5px] font-medium"
                  >
                    {modalErrorMessage}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="supplier-rejection-reason"
                    className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                  >
                    Alasan Penolakan <span className="text-[#B43232]">*</span>
                  </label>
                  <textarea
                    id="supplier-rejection-reason"
                    name="rejection_reason"
                    rows={3}
                    required
                    disabled={isAnyProcessing}
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      if (modalErrorMessage) {
                        setModalErrorMessage("");
                      }
                    }}
                    placeholder="Contoh: Dokumen legalitas atau informasi kontak perusahaan belum lengkap."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors resize-y"
                  />
                </div>
              </div>

              <div className="px-4 sm:px-6 py-3.5 border-t border-[#E8EEF4] bg-[#FAFBFD] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseRejectModal}
                  disabled={isAnyProcessing}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F7F9FA] text-[#30465B] text-[12px] font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={!isReasonValid || isAnyProcessing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#B43232] hover:bg-[#992626] disabled:opacity-50 disabled:pointer-events-none text-white text-[12px] font-semibold shadow-[0_6px_16px_rgba(180,50,50,0.2)] transition-colors cursor-pointer"
                >
                  {isCurrentRejectProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.2} />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Reject</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
