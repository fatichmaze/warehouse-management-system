"use client";

import Link from "next/link";
import { ArrowLeft, Package, ReceiptText } from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";

function getProductStockStatus(product) {
  const currentStock = Number(product?.current_stock ?? 0);
  const minStock = Number(product?.min_stock ?? 0);
  const lowStock = Number(product?.low_stock ?? 0);

  if (currentStock === 0) {
    return "Out of Stock";
  }
  if (currentStock > 0 && currentStock <= minStock) {
    return "Severe";
  }
  if (currentStock > minStock && currentStock <= lowStock) {
    return "Low Stock";
  }
  return "Normal";
}

function getStockBadgeStyle(status) {
  switch (status) {
    case "Out of Stock":
      return "bg-[#2D4356] text-white";
    case "Severe":
      return "bg-[#FDECEC] text-[#C53030]";
    case "Low Stock":
      return "bg-[#FEF5E7] text-[#D9822B]";
    case "Normal":
    default:
      return "bg-[#EAF6EE] text-[#2F855A]";
  }
}

function formatRupiah(value) {
  const numericValue = Number(value ?? 0);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  return `Rp ${Math.round(safeValue).toLocaleString("id-ID")}`;
}

function formatDateDisplay(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTransactionType(type) {
  const normalized = String(type ?? "").toLowerCase();
  if (normalized === "incoming" || normalized === "in" || normalized === "barang_masuk") {
    return "Barang Masuk";
  }
  if (normalized === "outgoing" || normalized === "out" || normalized === "barang_keluar") {
    return "Barang Keluar";
  }
  return type || "-";
}

function getTransactionStatusStyle(status) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "approved" || normalized === "shipped" || normalized === "completed") {
    return "bg-[#EAF6EE] text-[#2F855A]";
  }
  if (normalized === "rejected" || normalized === "cancelled" || normalized === "failed") {
    return "bg-[#FDECEC] text-[#C53030]";
  }
  if (normalized === "pending") {
    return "bg-[#FEF5E7] text-[#D9822B]";
  }
  return "bg-[#F7F9FA] text-[#637587]";
}

export default function ProductDetailsClient({
  userName = "Admin Tataloka",
  userRole = "",
  product = null,
  recentTransactions = [],
}) {
  const safeCurrentStock = Number.isFinite(Number(product?.current_stock))
    ? Number(product.current_stock)
    : 0;
  const safeMinStock = Number.isFinite(Number(product?.min_stock))
    ? Number(product.min_stock)
    : 0;
  const safeLowStock = Number.isFinite(Number(product?.low_stock))
    ? Number(product.low_stock)
    : 0;

  const stockStatus = getProductStockStatus(product);
  const badgeStyle = getStockBadgeStyle(stockStatus);

  const normalizedRole = String(userRole ?? "").toLowerCase();
  const isWarehouseManager = normalizedRole === "warehouse_manager";
  const needsRestock = safeCurrentStock <= safeLowStock;
  const canCreateRestockOrder = isWarehouseManager && needsRestock;

  const limitedTransactions = Array.isArray(recentTransactions)
    ? recentTransactions.slice(0, 5)
    : [];

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar pendingCount={0} />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar adminName={userName} currentSection="Products" />

          <main className="flex-1 px-7 pt-3 pb-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link
                  href="/admin/products"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#527DA3] hover:text-[#30465B] transition-colors mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Kembali ke Product Management</span>
                </Link>
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="text-[32px] leading-[1.15] font-bold tracking-tight text-[#30465B]"
                    style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                  >
                    {product?.name || "Product Details"}
                  </h1>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold leading-none ${badgeStyle}`}
                  >
                    {stockStatus}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[#8998A5]">
                  SKU:{" "}
                  <span className="font-semibold text-[#527DA3]">
                    {product?.sku || "-"}
                  </span>{" "}
                  • Kategori:{" "}
                  <span className="font-semibold text-[#30465B]">
                    {product?.category_name || "-"}
                  </span>
                </p>
              </div>
            </div>

            {canCreateRestockOrder ? (
              <div
                role="status"
                className="rounded-2xl bg-[#FEF5E7] border border-[#F7D7A8] px-4 py-3 text-[12px] text-[#B76E1E]"
              >
                Stok produk berada pada batas stok rendah ({safeCurrentStock.toLocaleString("id-ID")} {product?.unit || ""}). Alur pembuatan Restock Order untuk Warehouse Manager akan dihubungkan setelah modul Restock Order tersedia.
              </div>
            ) : null}

            <section className="rounded-2xl bg-white border border-[#E8EEF4] shadow-[0_2px_10px_rgba(48,70,91,0.04)] p-6 space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F6] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#F7F9FA] border border-[#E8EEF4] text-[#527DA3] inline-flex items-center justify-center">
                    <Package className="w-4 h-4" strokeWidth={1.9} />
                  </span>
                  <h2
                    className="text-[18px] font-bold text-[#30465B]"
                    style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                  >
                    Informasi Lengkap Produk
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-[#F7F9FA] border border-[#E8EEF4] p-4 flex flex-col items-center justify-center min-h-48">
                  {product?.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product?.name || "Gambar produk"}
                      className="max-h-44 w-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="text-center space-y-1.5">
                      <Package
                        className="w-8 h-8 mx-auto text-[#8998A5]"
                        strokeWidth={1.6}
                      />
                      <p className="text-[12px] font-medium text-[#637587]">
                        Tidak ada gambar produk
                      </p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-[12.5px]">
                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      SKU
                    </p>
                    <p className="mt-1 font-semibold text-[#527DA3]">
                      {product?.sku || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Kategori
                    </p>
                    <p className="mt-1 font-semibold text-[#30465B]">
                      {product?.category_name || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Lokasi Rak
                    </p>
                    <p className="mt-1 font-semibold text-[#30465B]">
                      {product?.rack_location || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Stok Saat Ini
                    </p>
                    <p className="mt-1 font-bold text-[#30465B] tabular-nums">
                      {safeCurrentStock.toLocaleString("id-ID")}{" "}
                      <span className="font-medium text-[#637587]">
                        {product?.unit || ""}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Stok Minimum (Severe)
                    </p>
                    <p className="mt-1 font-semibold text-[#30465B] tabular-nums">
                      {safeMinStock.toLocaleString("id-ID")}{" "}
                      <span className="font-normal text-[#637587]">
                        {product?.unit || ""}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Batas Stok Low
                    </p>
                    <p className="mt-1 font-semibold text-[#30465B] tabular-nums">
                      {safeLowStock.toLocaleString("id-ID")}{" "}
                      <span className="font-normal text-[#637587]">
                        {product?.unit || ""}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Harga Beli
                    </p>
                    <p className="mt-1 font-semibold text-[#30465B] tabular-nums">
                      {formatRupiah(product?.purchase_price)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Harga Jual
                    </p>
                    <p className="mt-1 font-semibold text-[#30465B] tabular-nums">
                      {formatRupiah(product?.selling_price)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Tanggal Dibuat
                    </p>
                    <p className="mt-1 font-medium text-[#30465B]">
                      {formatDateDisplay(product?.created_at)}
                    </p>
                  </div>

                  <div className="sm:col-span-2 md:col-span-3 rounded-xl bg-[#FAFBFD] border border-[#EEF2F6] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      Deskripsi
                    </p>
                    <p className="mt-1 text-[#637587] leading-relaxed">
                      {product?.description || "Tidak ada deskripsi produk."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white border border-[#E8EEF4] shadow-[0_2px_10px_rgba(48,70,91,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#EEF2F6] flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#F7F9FA] border border-[#E8EEF4] text-[#527DA3] inline-flex items-center justify-center">
                  <ReceiptText className="w-4 h-4" strokeWidth={1.9} />
                </span>
                <div>
                  <h2
                    className="text-[18px] font-bold text-[#30465B]"
                    style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                  >
                    5 Transaksi Terakhir
                  </h2>
                  <p className="text-[11.5px] text-[#8998A5]">
                    Riwayat transaksi terbaru yang melibatkan produk ini.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-180 border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F7F9FA] border-b border-[#E8EEF4] text-[10.5px] font-semibold uppercase tracking-wider text-[#8998A5]">
                      <th className="py-3 pl-6 pr-3 whitespace-nowrap">
                        No. Transaksi
                      </th>
                      <th className="py-3 px-3 whitespace-nowrap">Tipe</th>
                      <th className="py-3 px-3 whitespace-nowrap">Tanggal</th>
                      <th className="py-3 px-3 whitespace-nowrap text-right">
                        Quantity
                      </th>
                      <th className="py-3 px-3 whitespace-nowrap">Status</th>
                      <th className="py-3 pl-3 pr-6 whitespace-nowrap">
                        Keterangan / Tujuan
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EEF2F6] text-[12.5px] text-[#30465B]">
                    {limitedTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 px-6 text-center text-[12px] text-[#8998A5]"
                        >
                          Belum ada riwayat transaksi untuk produk ini.
                        </td>
                      </tr>
                    ) : (
                      limitedTransactions.map((trx, index) => {
                        const qty = Number(trx?.quantity ?? 0);
                        const trxStatus = trx?.status || "-";
                        const detailNote =
                          trx?.customer_destination ||
                          trx?.notes ||
                          trx?.rejection_reason ||
                          "-";

                        return (
                          <tr
                            key={
                              trx?.transaction_item_id ??
                              `${trx?.transaction_id ?? "trx"}-${index}`
                            }
                            className="hover:bg-[#FAFBFD] transition-colors"
                          >
                            <td className="py-3 pl-6 pr-3 font-semibold text-[#527DA3] whitespace-nowrap">
                              {trx?.transaction_number ||
                                `#${trx?.transaction_id ?? "-"}`}
                            </td>
                            <td className="py-3 px-3 text-[#637587] whitespace-nowrap">
                              {formatTransactionType(trx?.type)}
                            </td>
                            <td className="py-3 px-3 text-[#637587] whitespace-nowrap">
                              {formatDateDisplay(
                                trx?.transaction_date || trx?.transaction_created_at
                              )}
                            </td>
                            <td className="py-3 px-3 font-semibold text-right whitespace-nowrap tabular-nums">
                              {Number.isFinite(qty)
                                ? qty.toLocaleString("id-ID")
                                : "0"}{" "}
                              <span className="font-normal text-[#637587]">
                                {product?.unit || ""}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none ${getTransactionStatusStyle(
                                  trxStatus
                                )}`}
                              >
                                {trxStatus}
                              </span>
                            </td>
                            <td className="py-3 pl-3 pr-6 text-[#637587] max-w-64 truncate">
                              {detailNote}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}