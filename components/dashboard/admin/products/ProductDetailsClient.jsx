"use client";

import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import {
  getProductStockStatus,
  getStockBadgeStyle,
} from "./productDetailsHelpers";
import ProductInfoSection from "./ProductInfoSection";
import ProductTransactionsSection from "./ProductTransactionsSection";

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
  const canCreateRestockOrder =
    isWarehouseManager && needsRestock && product?.id;

  const limitedTransactions = Array.isArray(recentTransactions)
    ? recentTransactions.slice(0, 5)
    : [];

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] p-2.5 text-[#30465B] sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-350 flex-col items-start gap-3 sm:gap-4 md:flex-row">
        <AdminSidebar pendingCount={0} role={userRole} />

        <div className="flex w-full min-w-0 flex-1 flex-col rounded-3xl border border-white/90 bg-white/95 shadow-[0_14px_36px_rgba(48,70,91,0.08)] sm:rounded-[28px]">
          <AdminTopbar
            adminName={userName}
            role={userRole}
            currentSection="Products"
          />

          <main className="min-w-0 flex-1 space-y-4 px-4 pb-5 pt-3 sm:space-y-5 sm:px-7 sm:pb-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <Link
                  href="/admin/products"
                  className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#527DA3] transition-colors hover:text-[#30465B]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  <span>Kembali ke Product Management</span>
                </Link>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1
                    className="break-words text-[24px] font-bold leading-[1.15] tracking-tight text-[#30465B] sm:text-[32px]"
                    style={{
                      fontFamily: "var(--font-bricolage), sans-serif",
                    }}
                  >
                    {product?.name || "Product Details"}
                  </h1>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-semibold leading-none ${badgeStyle}`}
                  >
                    {stockStatus}
                  </span>
                </div>

                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-[#8998A5]">
                  <span>
                    SKU:{" "}
                    <span className="font-semibold text-[#527DA3]">
                      {product?.sku || "-"}
                    </span>
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>
                    Kategori:{" "}
                    <span className="font-semibold text-[#30465B]">
                      {product?.category_name || "-"}
                    </span>
                  </span>
                </p>
              </div>
            </div>

            {canCreateRestockOrder ? (
              <div
                role="status"
                className="flex flex-col gap-3 rounded-2xl border border-[#F7D7A8] bg-[#FEF5E7] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:py-4"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#B76E1E]">
                    Stok produk mencapai batas stok rendah.
                  </p>

                  <p className="mt-1 text-[11px] text-[#B76E1E]">
                    Stok saat ini:{" "}
                    <span className="font-bold">
                      {safeCurrentStock.toLocaleString("id-ID")}{" "}
                      {product?.unit || ""}
                    </span>
                    . Buat Restock Order untuk pengadaan produk ini.
                  </p>
                </div>

                <Link
                  href={`/warehouse-manager/restock-orders?productId=${encodeURIComponent(
                    String(product.id)
                  )}`}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#527DA3] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#426B90] sm:w-auto"
                >
                  <PackagePlus size={15} />
                  Buat Restock Order
                </Link>
              </div>
            ) : null}

            <ProductInfoSection
              product={product}
              safeCurrentStock={safeCurrentStock}
              safeMinStock={safeMinStock}
              safeLowStock={safeLowStock}
            />

            <ProductTransactionsSection
              transactions={limitedTransactions}
              unit={product?.unit || ""}
            />
          </main>
        </div>
      </div>
    </div>
  );
}