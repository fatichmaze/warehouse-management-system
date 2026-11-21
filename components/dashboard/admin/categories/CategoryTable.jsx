"use client";

import {
  Pencil,
  Trash2,
  FolderOpen,
  FolderSearch,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push("ellipsis-left");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis-right");
  }

  pages.push(totalPages);
  return pages;
}

export default function CategoryTable({
  categories = [],
  hasAnyCategories = false,
  searchQuery = "",
  filterMode = "all",
  totalFilteredCount = 0,
  currentPage = 1,
  pageSize = 6,
  onPageChange,
  onEditCategory,
  onDeleteCategory,
}) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeTotalFiltered = Math.max(0, Number(totalFilteredCount ?? 0));
  const safePageSize = Math.max(1, Number(pageSize ?? 6));
  const totalPages = Math.max(1, Math.ceil(safeTotalFiltered / safePageSize));
  const safeCurrentPage = Math.min(
    Math.max(1, Number(currentPage ?? 1)),
    totalPages
  );

  const startIndex =
    safeTotalFiltered === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1;
  const endIndex =
    safeTotalFiltered === 0
      ? 0
      : Math.min(safeCurrentPage * safePageSize, safeTotalFiltered);

  const paginationItems = buildPaginationItems(safeCurrentPage, totalPages);
  const hasActiveFilterOrSearch =
    Boolean(String(searchQuery ?? "").trim()) || filterMode !== "all";

  return (
    <div className="rounded-2xl bg-white border border-[#E8EEF4] shadow-[0_2px_10px_rgba(48,70,91,0.04)] overflow-hidden">
      <div className="overflow-x-auto">195
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead>
            <tr className="bg-[#F7F9FA] border-b border-[#E8EEF4] text-[10.5px] font-semibold uppercase tracking-wider text-[#8998A5]">
              <th className="py-3.5 pl-5 pr-4 whitespace-nowrap w-[22%]">
                CATEGORY NAME
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap w-[36%]">
                DESCRIPTION
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap text-center w-[15%]">
                TOTAL PRODUCTS
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap w-[15%]">
                CREATED DATE
              </th>
              <th className="py-3.5 pl-4 pr-5 whitespace-nowrap text-right w-[12%]">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EEF2F6] text-[12.5px] text-[#30465B]">
            {safeCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 px-6 text-center">
                  {!hasAnyCategories ? (
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <span className="w-10 h-10 rounded-2xl bg-[#F7F9FA] border border-[#E8EEF4] text-[#8998A5] flex items-center justify-center mb-3">
                        <FolderOpen className="w-5 h-5" strokeWidth={1.8} />
                      </span>
                      <p className="text-[13px] font-semibold text-[#30465B]">
                        Belum ada kategori terdaftar
                      </p>
                      <p className="mt-1 text-[12px] text-[#8998A5] leading-relaxed">
                        Tambahkan kategori baru untuk mulai mengelompokkan produk di gudang.
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <span className="w-10 h-10 rounded-2xl bg-[#F7F9FA] border border-[#E8EEF4] text-[#8998A5] flex items-center justify-center mb-3">
                        <FolderSearch className="w-5 h-5" strokeWidth={1.8} />
                      </span>
                      <p className="text-[13px] font-semibold text-[#30465B]">
                        Tidak ada kategori yang cocok
                      </p>
                      <p className="mt-1 text-[12px] text-[#8998A5] leading-relaxed">
                        {hasActiveFilterOrSearch
                          ? "Coba ubah kata kunci pencarian atau sesuaikan filter kategori."
                          : "Tidak ada data kategori untuk ditampilkan pada halaman ini."}
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              safeCategories.map((category, index) => {
                const productCount = Number(category?.product_count ?? 0);
                const safeProductCount = Number.isFinite(productCount)
                  ? productCount
                  : 0;

                return (
                  <tr
                    key={category?.id ?? `category-${index}`}
                    className="hover:bg-[#FAFBFD] transition-colors align-middle"
                  >
                    <td className="py-3.5 pl-5 pr-4 font-semibold text-[#30465B] whitespace-nowrap">
                      {category?.name || "-"}
                    </td>

                    <td className="py-3.5 px-4 text-[#637587] max-w-md">
                      <div
                        className="truncate"
                        title={category?.description || undefined}
                      >
                        {category?.description ? category.description : "-"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#30465B] text-center whitespace-nowrap tabular-nums">
                      {safeProductCount.toLocaleString("id-ID")} produk
                    </td>

                    <td className="py-3.5 px-4 text-[#637587] whitespace-nowrap">
                      {formatDateDisplay(category?.created_at)}
                    </td>

                    <td className="py-3.5 pl-4 pr-5 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditCategory?.(category)}
                          title={`Edit ${category?.name || "kategori"}`}
                          aria-label={`Edit ${category?.name || "kategori"}`}
                          className="w-7 h-7 rounded-lg bg-[#F7F9FA] hover:bg-[#EDF2F7] border border-[#E8EEF4] text-[#637587] hover:text-[#30465B] inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCategory?.(category)}
                          title={`Delete ${category?.name || "kategori"}`}
                          aria-label={`Delete ${category?.name || "kategori"}`}
                          className="w-7 h-7 rounded-lg bg-[#F7F9FA] hover:bg-[#FDECEC] border border-[#E8EEF4] hover:border-[#F5C2C2] text-[#637587] hover:text-[#C53030] inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3.5 bg-[#FAFBFD] border-t border-[#E8EEF4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[12px] text-[#8998A5]">
          {safeTotalFiltered === 0
            ? "Showing 0 of 0 categories"
            : `Showing ${startIndex}–${endIndex} of ${safeTotalFiltered} categories`}
        </p>

        {totalPages > 1 ? (
          <nav
            aria-label="Pagination kategori"
            className="inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <button
              type="button"
              disabled={safeCurrentPage <= 1 || safeTotalFiltered === 0}
              onClick={() => onPageChange?.(Math.max(1, safeCurrentPage - 1))}
              aria-label="Halaman sebelumnya"
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#30465B] hover:bg-[#F7F9FA] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.9} />
            </button>

            {paginationItems.map((item, idx) => {
              if (typeof item === "string") {
                return (
                  <span
                    key={`${item}-${idx}`}
                    className="px-1.5 text-[12px] text-[#8998A5] select-none"
                  >
                    ...
                  </span>
                );
              }

              const isActivePage = item === safeCurrentPage;

              return (
                <button
                  key={item}
                  type="button"
                  disabled={safeTotalFiltered === 0}
                  onClick={() => onPageChange?.(item)}
                  aria-current={isActivePage ? "page" : undefined}
                  className={`min-w-8 h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                    isActivePage
                      ? "bg-[#2D4356] text-white shadow-[0_4px_10px_rgba(45,67,86,0.18)]"
                      : "bg-white border border-[#E2E8F0] text-[#30465B] hover:bg-[#F7F9FA]"
                  }`}
                >
                  {item}
                </button>
              );
            })}

            <button
              type="button"
              disabled={
                safeCurrentPage >= totalPages || safeTotalFiltered === 0
              }
              onClick={() =>
                onPageChange?.(Math.min(totalPages, safeCurrentPage + 1))
              }
              aria-label="Halaman berikutnya"
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#30465B] hover:bg-[#F7F9FA] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.9} />
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}