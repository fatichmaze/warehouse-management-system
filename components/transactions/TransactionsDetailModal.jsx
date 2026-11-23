"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import TransactionStatusBadge from "./TransactionStatusBadge";
import { callApi, formatDateId } from "./api";

const btn =
  "h-10 px-4 rounded-xl text-[12.5px] font-semibold disabled:opacity-60 cursor-pointer transition-colors";

export default function TransactionDetailModal({
  transactionId,
  role,
  userId,
  onClose,
  onChanged,
  onEdit,
}) {
  const [state, setState] = useState({ id: null, data: null, error: "" });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const loading = state.id !== transactionId;
  const trx = state.data;

  useEffect(() => {
    let cancelled = false;

    callApi(`/api/transactions/${transactionId}`)
      .then((json) => {
        if (!cancelled) {
          setState({ id: transactionId, data: json.data, error: "" });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ id: transactionId, data: null, error: err.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  const isManager = role === "warehouse_manager";
  const isStaff = role === "staff";
  const isPending = trx?.status === "Pending";
  const isOwner = trx ? trx.created_by === userId : false;

  // Izin ini sama dengan aturan di lib/transaction-service.js.
  const canApprove = isManager && isPending;
  const canEdit = isStaff && isOwner && isPending;
  const canDelete = isStaff && isOwner && isPending;
  const canShip =
    isStaff && isOwner && trx?.type === "outgoing" && trx?.status === "Approved";

  async function run(task, successMessage) {
    setBusy(true);
    setActionError("");
    try {
      await task();
      onChanged(successMessage);
    } catch (err) {
      setActionError(err.message);
      setBusy(false);
    }
  }

  function postStatus(payload) {
    return callApi(`/api/transactions/${transactionId}/status`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function handleApprove() {
    const msg =
      trx?.type === "incoming"
        ? "Transaksi masuk disetujui. Stok diperbarui."
        : "Transaksi keluar disetujui. Siap dikemas oleh Staff.";

    return run(() => postStatus({ action: "approve" }), msg);
  }

  function handleReject() {
    if (!reason.trim()) {
      setActionError("Alasan penolakan wajib diisi.");
      return;
    }
    return run(
      () => postStatus({ action: "reject", reason }),
      "Transaksi ditolak. Stok tidak berubah."
    );
  }

  function handleShip() {
    return run(
      () => postStatus({ action: "ship" }),
      "Transaksi selesai dan ditandai Shipped. Stok telah dikurangi."
    );
  }

  function handleDelete() {
    if (!window.confirm("Hapus transaksi Pending ini?")) return;
    return run(
      () => callApi(`/api/transactions/${transactionId}`, { method: "DELETE" }),
      "Transaksi berhasil dihapus."
    );
  }

  const footer = trx ? (
    rejecting ? (
      <>
        <button
          type="button"
          className={`${btn} border border-[#E8EEF4] text-[#637587]`}
          onClick={() => {
            setRejecting(false);
            setActionError("");
          }}
          disabled={busy}
        >
          Batal
        </button>
        <button
          type="button"
          className={`${btn} bg-[#C53030] text-white`}
          onClick={handleReject}
          disabled={busy}
        >
          {busy ? "Memproses..." : "Konfirmasi Tolak"}
        </button>
      </>
    ) : (
      <>
        {canDelete && (
          <button
            type="button"
            className={`${btn} border border-[#F3C7C7] text-[#C53030]`}
            onClick={handleDelete}
            disabled={busy}
          >
            Hapus
          </button>
        )}
        {canEdit && (
          <button
            type="button"
            className={`${btn} border border-[#E8EEF4] text-[#30465B]`}
            onClick={() => onEdit(trx)}
            disabled={busy}
          >
            Edit
          </button>
        )}
        {canApprove && (
          <>
            <button
              type="button"
              className={`${btn} border border-[#F3C7C7] text-[#C53030]`}
              onClick={() => {
                setRejecting(true);
                setActionError("");
              }}
              disabled={busy}
            >
              Tolak
            </button>
            <button
              type="button"
              className={`${btn} bg-[#2F855A] text-white`}
              onClick={handleApprove}
              disabled={busy}
            >
              {busy ? "Memproses..." : "Setujui"}
            </button>
          </>
        )}
        {canShip && (
          <button
            type="button"
            className={`${btn} bg-[#2D4356] text-white`}
            onClick={handleShip}
            disabled={busy}
          >
            {busy ? "Memproses..." : "Tandai Shipped"}
          </button>
        )}
      </>
    )
  ) : null;

  return (
    <Modal
      title={trx ? `Detail ${trx.transaction_number}` : "Detail Transaksi"}
      onClose={onClose}
      footer={footer}
      wide
    >
      {loading && <p className="text-[13px] text-[#8998A5]">Memuat detail...</p>}

      {!loading && state.error && (
        <p className="text-[13px] text-[#C53030]">{state.error}</p>
      )}

      {trx && (
        <div className="space-y-4 text-[12.5px]">
          <div className="grid grid-cols-2 gap-3">
            <Info
              label="Tipe"
              value={trx.type === "incoming" ? "Barang Masuk" : "Barang Keluar"}
            />
            <div>
              <p className="text-[11px] text-[#8998A5] mb-1">Status</p>
              <TransactionStatusBadge status={trx.status} />
            </div>
            <Info label="Tanggal" value={formatDateId(trx.transaction_date)} />
            <Info
              label={trx.type === "incoming" ? "Supplier" : "Customer/Tujuan"}
              value={
                trx.type === "incoming"
                  ? trx.supplier_name
                  : trx.customer_destination
              }
            />
            {trx.po_number && <Info label="Nomor PO" value={trx.po_number} />}
            <Info label="Dibuat oleh" value={trx.created_by_name} />
            {trx.approved_by_name && (
              <Info label="Diproses oleh" value={trx.approved_by_name} />
            )}
          </div>

          {trx.notes && <Info label="Catatan" value={trx.notes} />}

          {trx.status === "Rejected" && trx.rejection_reason && (
            <div className="rounded-xl bg-[#FDECEC] text-[#C53030] px-3.5 py-2.5">
              <p className="text-[11px] font-semibold mb-0.5">Alasan penolakan</p>
              <p>{trx.rejection_reason}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10.5px] text-[#8998A5] border-b border-[#E8EEF4]">
                  <th className="py-2 pr-3 font-semibold">SKU</th>
                  <th className="py-2 pr-3 font-semibold">Produk</th>
                  <th className="py-2 pr-3 font-semibold text-right">Qty</th>
                  <th className="py-2 font-semibold text-right">Stok saat ini</th>
                </tr>
              </thead>
              <tbody>
                {trx.items.map((item) => (
                  <tr key={item.product_id} className="border-b border-[#F1F5F9]">
                    <td className="py-2 pr-3 text-[#637587]">{item.sku}</td>
                    <td className="py-2 pr-3 font-medium">{item.name}</td>
                    <td className="py-2 pr-3 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 text-right text-[#637587]">
                      {item.current_stock} {item.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rejecting && (
            <div>
              <label
                className="text-[11px] font-semibold text-[#637587]"
                htmlFor="reject-reason"
              >
                Alasan penolakan (wajib)
              </label>
              <textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-[#E8EEF4] px-3 py-2 text-[13px] outline-none focus:border-[#527DA3]"
              />
            </div>
          )}

          {actionError && <p className="text-[#C53030]">{actionError}</p>}
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-[#8998A5] mb-0.5">{label}</p>
      <p className="font-medium text-[#30465B]">{value || "-"}</p>
    </div>
  );
}