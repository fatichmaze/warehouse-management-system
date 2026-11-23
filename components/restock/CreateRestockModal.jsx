"use client";

import { useState } from "react";
import { Plus, X, PackagePlus, Trash2 } from "lucide-react";
import { callApi } from "@/components/transactions/api";
import {
  StatusBadge,
  fieldCls,
  getLocalDate,
} from "./restockOrderHelpers";

export default function CreateRestockModal({
  suppliers,
  products,
  initialProductId = "",
  onClose,
  onSuccess,
}) {
  const today = getLocalDate();

  const [supplierId, setSupplierId] = useState("");
  const [orderDate] = useState(today);
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");

  const selectedInitialProductId = products.some(
    (product) => String(product.id) === String(initialProductId)
  )
    ? String(initialProductId)
    : "";

  const [items, setItems] = useState([
    {
      product_id: selectedInitialProductId,
      quantity: "1",
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function addItem() {
    setItems((current) => [
      ...current,
      { product_id: "", quantity: "1" },
    ]);
  }

  function removeItem(index) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    setItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function getAvailableProducts(currentIndex) {
    const selectedIds = items
      .filter((_, index) => index !== currentIndex)
      .map((item) => String(item.product_id))
      .filter(Boolean);

    return products.filter(
      (product) => !selectedIds.includes(String(product.id))
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!supplierId) {
      setError("Supplier wajib dipilih.");
      return;
    }

    if (!expectedDate) {
      setError("Tanggal estimasi pengiriman wajib diisi.");
      return;
    }

    if (expectedDate < orderDate) {
      setError(
        "Tanggal pengiriman tidak boleh lebih awal dari tanggal pemesanan."
      );
      return;
    }

    if (!notes.trim()) {
      setError("Catatan Restock Order wajib diisi.");
      return;
    }

    if (items.length === 0) {
      setError("Minimal satu produk harus dipilih.");
      return;
    }

    const normalizedItems = [];

    for (const item of items) {
      if (!item.product_id) {
        setError("Semua baris produk wajib dipilih.");
        return;
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isSafeInteger(quantity) ||
        quantity <= 0 ||
        quantity > 2147483647
      ) {
        setError("Kuantitas harus berupa bilangan bulat positif.");
        return;
      }

      normalizedItems.push({
        product_id: Number(item.product_id),
        quantity,
      });
    }

    const selectedIds = normalizedItems.map(
      (item) => item.product_id
    );

    if (new Set(selectedIds).size !== selectedIds.length) {
      setError("Produk yang sama tidak boleh dipilih dua kali.");
      return;
    }

    setSubmitting(true);

    try {
      await callApi("/api/restock-orders", {
        method: "POST",
        body: JSON.stringify({
          supplier_id: Number(supplierId),
          order_date: orderDate,
          expected_delivery_date: expectedDate,
          notes: notes.trim(),
          items: normalizedItems,
        }),
      });

      onSuccess();
    } catch (err) {
      setError(err.message || "Gagal membuat Restock Order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#30465B]/45 backdrop-blur-[2px] p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#E8EEF4] bg-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(48,70,91,0.18)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEAF3] text-[#527DA3]">
              <PackagePlus size={19} />
            </div>
            <h2
              className="text-[24px] leading-tight font-bold text-[#30465B]"
              style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
            >
              Tambah Restock Order
            </h2>
            <p className="mt-1 text-[12px] text-[#8998A5]">
              Buat pesanan pengadaan stok barang baru.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup modal"
            className="rounded-xl border border-[#E8EEF4] p-2 text-[#637587] transition hover:bg-[#F7F9FA] disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#30465B]">
                Nomor PO
              </label>
              <input
                value="Dibuat otomatis oleh sistem"
                disabled
                className={`${fieldCls} w-full bg-[#F7F9FA] text-[#8998A5]`}
              />
              <p className="mt-1 text-[10px] text-[#8998A5]">
                Nomor PO dibuat setelah pesanan disimpan.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#30465B]">
                Supplier <span className="text-[#C53030">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(event) => setSupplierId(event.target.value)}
                required
                className={`${fieldCls} w-full`}
              >
                <option value="">Pilih Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.company_name || supplier.name}
                  </option>
                ))}
              </select>

              {suppliers.length === 0 && (
                <p className="mt-1 text-[10px] text-[#C53030]">
                  Belum ada Supplier yang disetujui.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#30465B]">
                Tanggal Pemesanan
              </label>
              <input
                type="date"
                value={orderDate}
                disabled
                className={`${fieldCls} w-full bg-[#F7F9FA] text-[#8998A5]`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#30465B]">
                Estimasi Pengiriman{" "}
                <span className="text-[#C53030]">*</span>
              </label>
              <input
                type="date"
                value={expectedDate}
                min={orderDate}
                onChange={(event) => setExpectedDate(event.target.value)}
                required
                className={`${fieldCls} w-full`}
              />
            </div>
          </div>

          <div className="border-t border-[#E8EEF4] pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-bold text-[#30465B]">
                  Daftar Produk
                </h3>
                <p className="mt-0.5 text-[11px] text-[#8998A5]">
                  Pilih produk dan tentukan jumlah yang dipesan.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={
                  items.length >= products.length ||
                  products.length === 0
                }
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#DCE6EF] bg-white px-3 py-2 text-[11px] font-semibold text-[#527DA3] transition hover:bg-[#F7F9FA] disabled:opacity-40"
              >
                <Plus size={14} />
                Tambah Produk
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-2xl border border-[#E8EEF4] bg-[#F8FAFC] p-3 sm:grid-cols-[1fr_130px_40px] sm:items-end"
                >
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-[#637587]">
                      Produk {index + 1}
                    </label>
                    <select
                      value={item.product_id}
                      onChange={(event) =>
                        updateItem(index, "product_id", event.target.value)
                      }
                      required
                      className={`${fieldCls} w-full`}
                    >
                      <option value="">Pilih Produk</option>
                      {getAvailableProducts(index).map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-[#637587]">
                      Kuantitas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="2147483647"
                      step="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                      required
                      className={`${fieldCls} w-full`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    aria-label={`Hapus produk ${index + 1}`}
                    className="flex h-10 items-center justify-center rounded-xl border border-[#F5C2C7] bg-white text-[#C53030] transition hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <p className="mt-2 text-[11px] text-[#C53030]">
                Belum ada produk yang tersedia di database.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#30465B]">
              Catatan <span className="text-[#C53030">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Tuliskan catatan atau keterangan pesanan..."
              required
              className={`${fieldCls} w-full resize-y`}
            />
          </div>

          <div className="rounded-xl border border-[#E8EEF4] bg-[#F8FAFC] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#8998A5]">
                Status awal setelah disimpan
              </span>
              <StatusBadge status="Pending" />
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-[#8998A5]">
              Pembuatan PO tidak langsung mengubah stok barang. Stok akan
              bertambah setelah transaksi barang masuk disetujui oleh
              Warehouse Manager.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-[#F5C2C7] bg-[#FDECEC] px-4 py-3 text-[12px] font-medium text-[#C53030]"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-[#E8EEF4] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-[#DCE6EF] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#637587] transition hover:bg-[#F7F9FA] disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                suppliers.length === 0 ||
                products.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#527DA3] px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#426B90] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan Restock Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}