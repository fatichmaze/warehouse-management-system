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
} from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import { callApi } from "@/components/transactions/api";
import {
  STATUSES,
  StatusBadge,
  fieldCls,
  formatDate,
} from "./restockOrderHelpers";
import CreateRestockModal from "./CreateRestockModal";
import RestockOrderDetailModal from "./RestockOrderDetailModal";

export default function RestockOrdersClient({
  role,
  userName,
  suppliers = [],
  products = [],
  initialProductId = "",
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

  const hasInitialProduct = products.some(
    (product) => String(product.id) === String(initialProductId)
  );
  const [showCreateModal, setShowCreateModal] = useState(hasInitialProduct);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!hasInitialProduct || typeof window === "undefined") return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has("productId")) return;

    url.searchParams.delete("productId");
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [hasInitialProduct]);

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

  async function handleStatusUpdated(orderId) {
    setSuccessMessage("Status Restock Order berhasil diperbarui.");
    setRefreshKey((current) => current + 1);
    await openDetail(orderId);
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
              <table className="w-full min-w-205 text-left text-[13px]">
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
                            onClick={() => openDetail(order.id)}
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
          initialProductId={initialProductId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      <RestockOrderDetailModal
        role={role}
        isManager={isManager}
        detailLoading={detailLoading}
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}