"use client";

import { Plus } from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import ProductSummaryCards from "@/components/dashboard/admin/products/ProductSummaryCards";

export default function AdminProductsClient({
  userName = "Admin Tataloka",
  initialProducts = [],
  initialCategories = [],
  initialSummary,
}) {
  const normalizedSummary = {
    totalProducts: Number(initialSummary?.totalProducts ?? 0),
    normal: Number(initialSummary?.normal ?? 0),
    lowStock: Number(initialSummary?.lowStock ?? 0),
    severe: Number(initialSummary?.severe ?? 0),
    outOfStock: Number(initialSummary?.outOfStock ?? 0),
  };

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar pendingCount={0} />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar adminName={userName} currentSection="Products" />

          <main className="flex-1 px-7 pt-3 pb-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1
                  className="text-[34px] leading-[1.12] font-bold tracking-tight text-[#30465B]"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Product Management
                </h1>
                <p className="mt-1 text-[12px] leading-relaxed text-[#8998A5]">
                  Kelola seluruh data produk, stok, dan harga jual di gudang Anda.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4356] hover:bg-[#233544] text-white text-[12.5px] font-semibold shadow-[0_6px_16px_rgba(45,67,86,0.18)] transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Add Product</span>
              </button>
            </div>

            <ProductSummaryCards summary={normalizedSummary} />

            <div className="text-[11px] text-[#8998A5]">
              {initialProducts.length} produk • {initialCategories.length} kategori
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}