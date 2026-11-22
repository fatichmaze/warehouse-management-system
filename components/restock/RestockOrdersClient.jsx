
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Plus,
  X,
  PackagePlus,
  Trash2,
} from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import { callApi, formatDateId } from "@/components/transactions/api";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Rejected",
  "In Transit",
  "Received",
];

const STATUS_STYLES = {
  Pending: "bg-[#F7EFE3] text-[#8C5A1E]",
  Confirmed: "bg-[#DCEAF3] text-[#527DA3]",
  Rejected: "bg-[#FDECEC] text-[#C53030]",
  "In Transit": "bg-[#E8EEF8] text-[#30465B]",
  Received: "bg-[#EAF6EE] text-[#2F855A]",
};

const fieldCls =
  "rounded-xl border border-[#DCE6EF] bg-white px-3.5 py-2.5 text-[12px] text-[#30465B] placeholder:text-[#8998A5] outline-none focus:border-[#527DA3]";

function formatDate(value) {
  if (!value) return "-";
  return formatDateId(String(value).slice(0, 10));
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
        STATUS_STYLES[status] || "bg-[#F7F9FA] text-[#637587]"
      }`}
    >
      {status}
    </span>
  );
}

function CreateRestockModal({
  suppliers,
  products,
  onClose,
  onSuccess,
}) {
  const today = getLocalDate();

  const [supplierId, setSupplierId] = useState("");
  const [orderDate] = useState(today);
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { product_id: "", quantity: "1" },
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#30465B]/45 backdrop-blur-[2px] p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[24px] border border-[#E8EEF4] bg-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(48,70,91,0.18)]">
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

export default function RestockOrdersClient({
  role,
  userName,
  suppliers = [],
  products = [],
}) {
  const isManager = role === "warehouse_manager";

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // State untuk aksi status PO
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "10",
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (status) {
          params.set("status", status);
        }

        const result = await callApi(
          `/api/restock-orders?${params.toString()}`
        );

        if (cancelled) return;

        setOrders(result.data || []);
        setPagination(
          result.pagination || {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (err) {
        if (cancelled) return;

        setError(err.message || "Gagal memuat Restock Orders.");
        setOrders([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [page, search, status, refreshKey]);

  async function openDetail(orderId) {
    setDetailLoading(true);
    setSelectedOrder(null);
    setError("");

    try {
      const result = await callApi(`/api/restock-orders/${orderId}`);
      setSelectedOrder(result.data);
    } catch (err) {
      setError(err.message || "Gagal memuat detail PO.");
    } finally {
      setDetailLoading(false);
    }
  }

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value) {
    setStatus(value);
    setPage(1);
  }

  function handleCreateSuccess() {
    setShowCreateModal(false);
    setPage(1);
    setSearch("");
    setStatus("");
    setSuccessMessage("Restock Order berhasil dibuat.");
    setRefreshKey((current) => current + 1);
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
      setSuccessMessage("Status Restock Order berhasil diperbarui.");
      setRefreshKey((current) => current + 1);

      await openDetail(orderId);
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
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar role={role} />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar
            adminName={userName}
            role={role}
            currentSection="Restock Orders"
          />

          <main className="flex-1 px-7 pt-3 pb-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1
                  className="text-[34px] leading-[1.08] font-bold tracking-tight text-[#30465B]"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Restock Orders
                </h1>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#8998A5]">
                  {isManager
                    ? "Kelola pesanan pengadaan stok barang."
                    : "Lihat dan konfirmasi pesanan dari warehouse."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isManager && (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccessMessage("");
                      setShowCreateModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#527DA3] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#426B90]"
                  >
                    <Plus size={15} />
                    Tambah Restock Order
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setRefreshKey((current) => current + 1)}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE6EF] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#30465B] transition hover:bg-[#F7F9FA] disabled:opacity-50"
                >
                  <RefreshCw size={15} strokeWidth={1.9} />
                  Refresh
                </button>
              </div>
            </div>

            {successMessage && (
              <div
                role="status"
                className="flex items-center justify-between gap-3 rounded-xl border border-[#C6E7D0] bg-[#EAF6EE] px-4 py-3 text-[12px] font-medium text-[#2F855A]"
              >
                <span>{successMessage}</span>
                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  aria-label="Tutup notifikasi"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <div className="rounded-[20px] bg-[#F8FAFC] border border-[#E8EEF4] p-3.5 flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              <div className="relative flex-1 min-w-0">
                <Search
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8998A5]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari nomor PO atau supplier..."
                  aria-label="Cari nomor PO atau supplier"
                  className={`${fieldCls} w-full pl-9`}
                />
              </div>

              <select
                value={status}
                onChange={(event) => handleStatus(event.target.value)}
                aria-label="Filter status Restock Order"
                className={`${fieldCls} md:w-48`}
              >
                <option value="">Semua Status</option>
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl bg-[#FDECEC] px-4 py-3 text-[12px] font-medium text-[#C53030]">
                {error}
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-[#E8EEF4]">
              <table className="w-full min-w-[820px] text-left text-[13px]">
                <thead>
                  <tr className="bg-[#F7F9FA] text-[10.5px] uppercase tracking-wider text-[#8998A5]">
                    <th className="px-4 py-3 font-semibold">Nomor PO</th>
                    <th className="px-4 py-3 font-semibold">Supplier</th>
                    <th className="px-4 py-3 font-semibold">Tanggal Pesan</th>
                    <th className="px-4 py-3 font-semibold">Estimasi Tiba</th>
                    <th className="px-4 py-3 font-semibold">Jumlah Item</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-[12px] text-[#8998A5]"
                      >
                        Memuat Restock Orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-[12px] text-[#8998A5]"
                      >
                        Belum ada Restock Order.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-[#F1F5F9] transition hover:bg-[#F8FAFC]"
                      >
                        <td className="px-4 py-3 font-semibold text-[#30465B]">
                          {order.po_number}
                        </td>
                        <td className="px-4 py-3 text-[#30465B]">
                          {order.supplier_name || "-"}
                        </td>
                        <td className="px-4 py-3 text-[#637587]">
                          {formatDate(order.order_date)}
                        </td>
                        <td className="px-4 py-3 text-[#637587]">
                          {formatDate(order.expected_delivery_date)}
                        </td>
                        <td className="px-4 py-3 text-[#637587]">
                          {order.item_count ?? 0} produk
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActionError("");
                              setShowRejectForm(false);
                              setRejectReason("");
                              openDetail(order.id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#DCEAF3]/75 px-3 py-1.5 text-[12px] font-semibold text-[#527DA3] transition hover:bg-[#DCEAF3]"
                          >
                            <Eye size={14} strokeWidth={1.9} />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 text-[12px] text-[#637587]">
              <p>
                Total{" "}
                <span className="font-semibold text-[#30465B]">
                  {pagination.total}
                </span>{" "}
                Restock Orders
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  aria-label="Halaman sebelumnya"
                  className="rounded-xl border border-[#E8EEF4] bg-white p-2 text-[#30465B] transition hover:bg-[#F7F9FA] disabled:opacity-40"
                >
                  <ChevronLeft size={16} strokeWidth={1.8} />
                </button>

                <span>
                  Halaman{" "}
                  <span className="font-semibold text-[#30465B]">
                    {pagination.page}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-[#30465B]">
                    {pagination.totalPages || 1}
                  </span>
                </span>

                <button
                  type="button"
                  disabled={
                    page >= (pagination.totalPages || 1) || loading
                  }
                  onClick={() => setPage((current) => current + 1)}
                  aria-label="Halaman berikutnya"
                  className="rounded-xl border border-[#E8EEF4] bg-white p-2 text-[#30465B] transition hover:bg-[#F7F9FA] disabled:opacity-40"
                >
                  <ChevronRight size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showCreateModal && isManager && (
        <CreateRestockModal
          suppliers={suppliers}
          products={products}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {(detailLoading || selectedOrder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#30465B]/45 backdrop-blur-[2px] p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#E8EEF4] bg-white p-6 shadow-[0_20px_50px_rgba(48,70,91,0.18)]">
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
                    onClick={() => {
                      setSelectedOrder(null);
                      setActionError("");
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
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

                {selectedOrder.status_notes && (
                  <div className="mt-4 rounded-xl border border-[#F5C2C7] bg-[#FDECEC] p-4">
                    <p className="text-[11px] font-semibold text-[#C53030]">
                      Alasan Penolakan
                    </p>
                    <p className="mt-1 text-[13px] text-[#9B2C2C]">
                      {selectedOrder.status_notes}
                    </p>
                  </div>
                )}

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
                    onClick={() => {
                      setSelectedOrder(null);
                      setActionError("");
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
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

                    {isManager && selectedOrder.status === "Confirmed" && (
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
      )}
    </div>
  );
}
