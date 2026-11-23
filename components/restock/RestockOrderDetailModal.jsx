"use client";

import { useState } from "react";
import { callApi } from "@/components/transactions/api";
import RestockTimeline from "@/components/restock/RestockTimeline";
import {
  StatusBadge,
  fieldCls,
  formatDate,
} from "./restockOrderHelpers";

export default function RestockOrderDetailModal({
  role,
  isManager,
  detailLoading,
  selectedOrder,
  onClose,
  onStatusUpdated,
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!detailLoading && !selectedOrder) {
    return null;
  }

  function handleClose() {
    if (actionLoading) return;

    setActionError("");
    setShowRejectForm(false);
    setRejectReason("");
    onClose();
  }

  async function handleStatusAction(action, reason = "") {
    if (!selectedOrder || actionLoading) return;

    const orderId = selectedOrder.id;

    setActionLoading(true);
    setActionError("");

    try {
      await callApi(`/api/restock-orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          action,
          reason,
        }),
      });

      setShowRejectForm(false);
      setRejectReason("");
      await onStatusUpdated(orderId);
    } catch (err) {
      setActionError(err.message || "Gagal memperbarui status PO.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleRejectSubmit(event) {
    event.preventDefault();

    if (!rejectReason.trim()) {
      setActionError("Alasan penolakan wajib diisi.");
      return;
    }

    handleStatusAction("reject", rejectReason.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#30465B]/45 backdrop-blur-[2px] p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#E8EEF4] bg-white p-6 shadow-[0_20px_50px_rgba(48,70,91,0.18)]">
        {detailLoading ? (
          <p className="py-10 text-center text-[12px] text-[#8998A5]">
            Memuat detail PO...
          </p>
        ) : (
          <>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-[22px] leading-tight font-bold text-[#30465B]"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Detail Restock Order
                </h2>
                <p className="mt-1 text-[12px] text-[#8998A5]">
                  {selectedOrder.po_number}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={actionLoading}
                className="rounded-xl border border-[#E8EEF4] px-3 py-1.5 text-[12px] font-semibold text-[#637587] transition hover:bg-[#F7F9FA] disabled:opacity-50"
              >
                Tutup
              </button>
            </div>

            <div className="mb-5 grid gap-4 rounded-2xl border border-[#E8EEF4] bg-[#F8FAFC] p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] text-[#8998A5]">Supplier</p>
                <p className="mt-1 text-[13px] font-semibold text-[#30465B]">
                  {selectedOrder.supplier_name ||
                    selectedOrder.supplier_company ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-[#8998A5]">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>

              <div>
                <p className="text-[11px] text-[#8998A5]">Tanggal Pesan</p>
                <p className="mt-1 text-[13px] font-medium text-[#30465B]">
                  {formatDate(selectedOrder.order_date)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-[#8998A5]">Estimasi Tiba</p>
                <p className="mt-1 text-[13px] font-medium text-[#30465B]">
                  {formatDate(selectedOrder.expected_delivery_date)}
                </p>
              </div>
            </div>

            <div className="mb-5">
              <RestockTimeline order={selectedOrder} />
            </div>

            <h3 className="mb-2.5 text-[13px] font-semibold text-[#30465B]">
              Daftar Produk
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-[#E8EEF4]">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-[#F7F9FA] text-[10.5px] uppercase tracking-wider text-[#8998A5]">
                    <th className="px-4 py-2.5 font-semibold">Produk</th>
                    <th className="px-4 py-2.5 font-semibold">SKU</th>
                    <th className="px-4 py-2.5 font-semibold text-right">
                      Jumlah
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedOrder.items || []).map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#F1F5F9]"
                    >
                      <td className="px-4 py-2.5 font-medium text-[#30465B]">
                        {item.product_name || item.name}
                      </td>
                      <td className="px-4 py-2.5 text-[#8998A5]">
                        {item.sku || "-"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#637587]">
                        {item.quantity} {item.unit || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5">
              <p className="text-[11px] text-[#8998A5]">Catatan</p>
              <p className="mt-1 whitespace-pre-wrap text-[13px] text-[#30465B]">
                {selectedOrder.notes || "-"}
              </p>
            </div>

            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-[#F5C2C7] bg-[#FDECEC] px-4 py-3 text-[12px] font-medium text-[#C53030]"
              >
                {actionError}
              </div>
            )}

            {role === "supplier" &&
              selectedOrder.status === "Pending" &&
              showRejectForm && (
                <form
                  onSubmit={handleRejectSubmit}
                  className="mt-4 rounded-xl border border-[#F5C2C7] bg-[#FFF8F8] p-4"
                >
                  <label className="mb-2 block text-[12px] font-semibold text-[#30465B]">
                    Alasan Penolakan{" "}
                    <span className="text-[#C53030]">*</span>
                  </label>

                  <textarea
                    value={rejectReason}
                    onChange={(event) =>
                      setRejectReason(event.target.value)
                    }
                    rows={3}
                    maxLength={2000}
                    required
                    disabled={actionLoading}
                    placeholder="Tuliskan alasan penolakan pesanan..."
                    className={`${fieldCls} w-full resize-y`}
                  />

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReason("");
                        setActionError("");
                      }}
                      disabled={actionLoading}
                      className="rounded-xl border border-[#DCE6EF] bg-white px-4 py-2 text-[12px] font-semibold text-[#637587] disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="rounded-xl bg-[#C53030] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#9B2C2C] disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Memproses..."
                        : "Kirim Penolakan"}
                    </button>
                  </div>
                </form>
              )}

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#E8EEF4] pt-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleClose}
                disabled={actionLoading}
                className="rounded-xl border border-[#DCE6EF] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#637587] transition hover:bg-[#F7F9FA] disabled:opacity-50"
              >
                Tutup
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                {role === "supplier" &&
                  selectedOrder.status === "Pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setActionError("");
                          setShowRejectForm(true);
                        }}
                        disabled={actionLoading || showRejectForm}
                        className="rounded-xl border border-[#F5C2C7] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#C53030] transition hover:bg-[#FDECEC] disabled:opacity-50"
                      >
                        Tolak Pesanan
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusAction("confirm")}
                        disabled={actionLoading || showRejectForm}
                        className="rounded-xl bg-[#527DA3] px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#426B90] disabled:opacity-50"
                      >
                        {actionLoading
                          ? "Memproses..."
                          : "Konfirmasi Pesanan"}
                      </button>
                    </>
                  )}

                {role === "supplier" &&
                  selectedOrder.status === "Confirmed" && (
                    <button
                      type="button"
                      onClick={() => handleStatusAction("in_transit")}
                      disabled={actionLoading}
                      className="rounded-xl bg-[#527DA3] px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#426B90] disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Memproses..."
                        : "Tandai In Transit"}
                    </button>
                  )}

                {isManager && selectedOrder.status === "In Transit" && (
                  <button
                    type="button"
                    onClick={() => handleStatusAction("received")}
                    disabled={actionLoading}
                    className="rounded-xl bg-[#2F855A] px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#276749] disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Memproses..."
                      : "Tandai Received"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}