"use client";

import { useMemo, useState } from "react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import ProductSummaryCards from "@/components/dashboard/admin/products/ProductSummaryCards";
import ProductFilterToolbar from "@/components/dashboard/admin/products/ProductFilterToolbar";
import ProductTable from "@/components/dashboard/admin/products/ProductTable";

const PAGE_SIZE = 6;

function getProductStockStatus(product) {
  const currentStock = Number(product?.current_stock ?? 0);
  const minStock = Number(product?.min_stock ?? 0);
  const lowStock = Number(product?.low_stock ?? 0);

  if (currentStock === 0) return "Out of Stock";
  if (currentStock <= minStock) return "Severe";
  if (currentStock <= lowStock) return "Low";
  return "Normal";
}

function getCreatedTimestamp(createdAt) {
  if (!createdAt) return 0;

  const time = new Date(createdAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

export default function StaffProductsClient({
  userName = "Staff Tataloka",
  initialProducts = [],
  initialCategories = [],
  initialSummary,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSummary = {
    totalProducts: Number(initialSummary?.totalProducts ?? 0),
    normal: Number(initialSummary?.normal ?? 0),
    lowStock: Number(initialSummary?.lowStock ?? 0),
    severe: Number(initialSummary?.severe ?? 0),
    outOfStock: Number(initialSummary?.outOfStock ?? 0),
  };

  const filteredAndSortedProducts = useMemo(() => {
    const productsList = Array.isArray(initialProducts)
      ? initialProducts
      : [];

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = productsList.filter((product) => {
      if (normalizedQuery) {
        const productName = String(product?.name ?? "").toLowerCase();
        const productSku = String(product?.sku ?? "").toLowerCase();

        if (
          !productName.includes(normalizedQuery) &&
          !productSku.includes(normalizedQuery)
        ) {
          return false;
        }
      }

      if (
        selectedCategoryId !== "all" &&
        String(product?.category_id ?? "") !== String(selectedCategoryId)
      ) {
        return false;
      }

      if (
        selectedStockStatus !== "all" &&
        getProductStockStatus(product) !== selectedStockStatus
      ) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const idA = Number(a?.id ?? 0);
      const idB = Number(b?.id ?? 0);

      switch (sortBy) {
        case "name_asc":
          return String(a?.name ?? "").localeCompare(
            String(b?.name ?? ""),
            "id",
            { sensitivity: "base" }
          );

        case "name_desc":
          return String(b?.name ?? "").localeCompare(
            String(a?.name ?? ""),
            "id",
            { sensitivity: "base" }
          );

        case "stock_asc":
          return Number(a?.current_stock ?? 0) -
            Number(b?.current_stock ?? 0);

        case "stock_desc":
          return Number(b?.current_stock ?? 0) -
            Number(a?.current_stock ?? 0);

        case "created_asc":
          return (
            getCreatedTimestamp(a?.created_at) -
            getCreatedTimestamp(b?.created_at)
          );

        case "created_desc":
        default:
          return (
            getCreatedTimestamp(b?.created_at) -
              getCreatedTimestamp(a?.created_at) ||
            idB - idA
          );
      }
    });
  }, [
    initialProducts,
    searchQuery,
    selectedCategoryId,
    selectedStockStatus,
    sortBy,
  ]);

  const totalFilteredCount = filteredAndSortedProducts.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredCount / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredAndSortedProducts.slice(
      startIdx,
      startIdx + PAGE_SIZE
    );
  }, [filteredAndSortedProducts, safeCurrentPage]);

  function handleSearchChange(value) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleCategoryChange(value) {
    setSelectedCategoryId(value);
    setCurrentPage(1);
  }

  function handleStockStatusChange(value) {
    setSelectedStockStatus(value);
    setCurrentPage(1);
  }

  function handleSortChange(value) {
    setSortBy(value);
    setCurrentPage(1);
  }

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-2.5 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 w-full mx-auto flex flex-col md:flex-row items-start gap-3 sm:gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar role="staff" />

        <div className="flex-1 w-full min-w-0 rounded-[24px] sm:rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar
            adminName={userName}
            role="staff"
            currentSection="Products"
          />

          <main className="flex-1 min-w-0 px-4 sm:px-7 pt-3 pb-5 sm:pb-7 space-y-4 sm:space-y-5">
            <div className="flex flex-col gap-2.5">
              <h1
                className="text-[26px] sm:text-[32px] lg:text-[34px] leading-[1.1] font-bold tracking-tight text-[#30465B]"
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                Product List
              </h1>

              <p className="text-[12px] leading-relaxed text-[#8998A5] max-w-2xl">
                Lihat informasi produk, ketersediaan stok, dan lokasi
                penyimpanan barang di gudang.
              </p>

              <div className="self-start inline-flex items-center gap-2 rounded-xl bg-[#EFF6FA] border border-[#DCE8F0] px-3 py-1.5 text-[11px] font-medium text-[#527DA3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#527DA3] shrink-0" />
                Mode lihat saja — Staff tidak dapat mengubah data produk.
              </div>
            </div>

            <ProductSummaryCards summary={normalizedSummary} />

            <ProductFilterToolbar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              categories={initialCategories}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategoryChange}
              selectedStockStatus={selectedStockStatus}
              onStockStatusChange={handleStockStatusChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            <ProductTable
              products={paginatedProducts}
              totalFilteredCount={totalFilteredCount}
              currentPage={safeCurrentPage}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              readOnly
            />
          </main>
        </div>
      </div>
    </div>
  );
}
