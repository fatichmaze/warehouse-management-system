"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { callApi } from "./api";

const labelCls = "block text-[12px] font-semibold text-[#30465B]";

const controlBase =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#30465B] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] disabled:text-[#8998A5] transition-colors";

const inputCls = `mt-1.5 ${controlBase}`;
const rowCls = controlBase;

const textareaCls =
  "mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors resize-y";

function localToday() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const emptyRow = () => ({ product_id: "", quantity: "" });

export default function TransactionFormModal({
  mode,
  type,
  products,
  suppliers,
  receivedOrders,
  initial,
  onClose,
  onSaved,
}) {
  const isEdit = mode === "edit";
  const trxType = isEdit ? initial.type : type;
  const isIncoming = trxType === "incoming";

  const [date, setDate] = useState(isEdit ? initial.transaction_date : localToday());
  const [poId, setPoId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState(isEdit ? initial.notes ?? "" : "");
  const [items, setItems] = useState(
    isEdit
      ? initial.items.map((i) => ({
          product_id: String(i.product_id),
          quantity: String(i.quantity),
        }))
      : [emptyRow()]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Item dikunci jika transaksi berasal dari PO (saat membuat atau mengedit).
  const itemsLocked =
    (!isEdit && isIncoming && poId !== "") ||
    (isEdit && initial.restock_order_id != null);

  function handlePoChange(value) {
    setPoId(value);

    if (!value) {
      setSupplierId("");
      setItems([emptyRow()]);
      return;
    }

    const po = receivedOrders.find((o) => String(o.id) === value);
    if (po) {
      setSupplierId(String(po.supplier_id));
      setItems(
        po.items.map((i) => ({
          product_id: String(i.product_id),
          quantity: String(i.quantity),
        }))
      );
    }
  }

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function removeItem(index) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanItems = items.map((i) => ({
      product_id: Number(i.product_id),
      quantity: Number(i.quantity),
    }));

    if (!itemsLocked && cleanItems.some((i) => !i.product_id || !(i.quantity > 0))) {
      setError("Pilih produk dan isi quantity (> 0) pada setiap baris.");
      return;
    }

    if (isIncoming && !notes.trim()) {
      setError("Catatan wajib diisi untuk barang masuk.");
      return;
    }

    if (!isEdit) {
      if (isIncoming && !poId && !supplierId) {
        setError("Supplier wajib dipilih.");
        return;
      }
      if (!isIncoming && !customer.trim()) {
        setError("Nama customer/tujuan wajib diisi.");
        return;
      }
    }

    setSaving(true);
    try {
      if (isEdit) {
        const body = itemsLocked ? { notes } : { notes, items: cleanItems };
        await callApi(`/api/transactions/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        onSaved("Transaksi berhasil diperbarui.");
      } else {
        const body = { type: trxType, transaction_date: date, notes };

        if (isIncoming) {
          if (poId) {
            body.restock_order_id = Number(poId);
          } else {
            body.supplier_id = Number(supplierId);
            body.items = cleanItems;
          }
        } else {
          body.customer_destination = customer;
          body.items = cleanItems;
        }

        await callApi("/api/transactions", {
          method: "POST",
          body: JSON.stringify(body),
        });
        onSaved("Transaksi berhasil dibuat dan menunggu persetujuan Manager.");
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const title = isEdit
    ? `Edit ${initial.transaction_number}`
    : isIncoming
    ? "Tambah Barang Masuk"
    : "Tambah Barang Keluar";

  return (
    <Modal title={title} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <div>
            <label className={labelCls} htmlFor="trx-date">
              {isIncoming ? "Tanggal penerimaan" : "Tanggal pengiriman"}
            </label>
            <input
              id="trx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
              required
            />
          </div>
        )}

        {!isEdit && isIncoming && (
          <>
            <div>
              <label className={labelCls} htmlFor="trx-po">
                Nomor PO{" "}
                <span className="font-medium text-[#8998A5]">
                  (opsional, hanya PO berstatus Received)
                </span>
              </label>
              <select
                id="trx-po"
                value={poId}
                onChange={(e) => handlePoChange(e.target.value)}
                className={inputCls}
              >
                <option value="">Tanpa PO</option>
                {receivedOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.po_number} — {o.supplier_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls} htmlFor="trx-supplier">
                Supplier
              </label>
              <select
                id="trx-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={poId !== ""}
                className={inputCls}
              >
                <option value="">Pilih supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {!isEdit && !isIncoming && (
          <div>
            <label className={labelCls} htmlFor="trx-customer">
              Nama customer/tujuan
            </label>
            <input
              id="trx-customer"
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              maxLength={150}
              className={inputCls}
            />
          </div>
        )}

        <div>
          <p className={labelCls}>Daftar produk</p>
          {itemsLocked && (
            <p className="text-[11.5px] text-[#8998A5] mt-0.5">
              Produk dan quantity berasal dari PO dan tidak dapat diubah.
            </p>
          )}

          <div className="mt-2 space-y-2.5">
            {items.map((row, index) => {
              const selected = products.find((p) => String(p.id) === row.product_id);
              return (
                <div key={index}>
                  <div className="grid grid-cols-[minmax(0,1fr)_6rem_2.25rem] items-center gap-2">
                    <select
                      value={row.product_id}
                      onChange={(e) => updateItem(index, "product_id", e.target.value)}
                      disabled={itemsLocked}
                      aria-label={`Produk baris ${index + 1}`}
                      className={`${rowCls} min-w-0`}
                    >
                      <option value="">Pilih produk</option>
                      {products.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={items.some(
                            (other, i) => i !== index && other.product_id === String(p.id)
                          )}
                        >
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={row.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      disabled={itemsLocked}
                      aria-label={`Quantity baris ${index + 1}`}
                      placeholder="Qty"
                      className={rowCls}
                    />

                    {!itemsLocked ? (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        aria-label="Hapus baris"
                        className="h-10 w-9 flex items-center justify-center rounded-lg text-[#C53030] hover:bg-[#FDECEC] disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>

                  {!isIncoming && selected && (
                    <p className="text-[11.5px] text-[#8998A5] mt-1">
                      Stok tersedia: {selected.current_stock} {selected.unit}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!itemsLocked && (
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, emptyRow()])}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#527DA3] hover:text-[#30465B] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              Tambah produk
            </button>
          )}
        </div>

        <div>
          <label className={labelCls} htmlFor="trx-notes">
            Catatan
            {isIncoming && (
              <span className="text-[#C53030] font-semibold"> *</span>
            )}
          </label>
          <textarea
            id="trx-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={
              isIncoming ? "Catatan penerimaan barang (wajib)" : "Catatan (opsional)"
            }
            className={textareaCls}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-[#FDECEC] border border-[#F5C2C2] px-4 py-2.5 text-[12px] font-medium text-[#C53030]"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 px-4 rounded-xl border border-[#E2E8F0] bg-white text-[12.5px] font-semibold text-[#637587] hover:bg-[#F7F9FA] disabled:opacity-60 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-xl bg-[#2D4356] text-white text-[12.5px] font-semibold hover:bg-[#233646] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Transaksi"}
          </button>
        </div>
      </form>
    </Modal>
  );
}