"use client";

import {
  Eye,
  Pencil,
  Trash2,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function getProductStockStatus(product) {
  const currentStock = Number(product?.current_stock ?? 0);
  const minStock = Number(product?.min_stock ?? 0);
  const lowStock = Number(product?.low_stock ?? 0);

  if (currentStock === 0) return "Out of Stock";
  if (currentStock <= minStock) return "Severe";
  if (currentStock <= lowStock) return "Low Stock";
  return "Normal";
}

function formatRupiah(value) {
  const numericValue = Number(value ?? 0);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  return `Rp ${Math.round(safeValue).toLocaleString("id-ID")}`;
}

function getStockBadgeStyle(status) {
  switch (status) {
    case "Out of Stock":
      return "bg-[#2D4356] text-white";
    case "Severe":
      return "bg-[#FDECEC] text-[#C53030]";
    case "Low Stock":
      return "bg-[#FEF5E7] text-[#D9822B]";
    default:
      return "bg-[#EAF6EE] text-[#2F855A]";
  }
}

function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis-left");

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) pages.push("ellipsis-right");

  pages.push(totalPages);
  return pages;
}

export default function ProductTable({
  products = [],
  totalFilteredCount = 0,
  currentPage = 1,
  pageSize = 6,
  onPageChange,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  readOnly = false,
}) {
  const safeTotalFiltered = Math.max(0, Number(totalFilteredCount ?? 0));
  const safePageSize = Math.max(1, Number(pageSize ?? 6));
  const totalPages = Math.max(
    1,
    Math.ceil(safeTotalFiltered / safePageSize)
  );

  const safeCurrentPage = Math.min(
    Math.max(1, Number(currentPage ?? 1)),
    totalPages
  );

  const startIndex =
    safeTotalFiltered === 0
      ? 0
      : (safeCurrentPage - 1) * safePageSize + 1;

  const endIndex =
    safeTotalFiltered === 0
      ? 0
      : Math.min(safeCurrentPage * safePageSize, safeTotalFiltered);

  const paginationItems = buildPaginationItems(
    safeCurrentPage,
    totalPages
  );

  return (
    <div className="rounded-2xl bg-white border border-[#E8EEF4] shadow-[0_2px_10px_rgba(48,70,91,0.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-240 border-collapse text-left">
          <thead>
            <tr className="bg-[#F7F9FA] border-b border-[#E8EEF4] text-[10.5px] font-semibold uppercase tracking-wider text-[#8998A5]">
              <th className="py-3.5 pl-5 pr-3 whitespace-nowrap">SKU</th>
              <th className="py-3.5 px-3 whitespace-nowrap">Product Name</th>
              <th className="py-3.5 px-3 whitespace-nowrap">Category</th>
              <th className="py-3.5 px-3 whitespace-nowrap text-right">
                Current Stock
              </th>
              <th className="py-3.5 px-3 whitespace-nowrap">Unit</th>
              <th className="py-3.5 px-3 whitespace-nowrap text-right">
                Selling Price
              </th>
              <th className="py-3.5 px-3 whitespace-nowrap">Rack Location</th>
              <th className="py-3.5 px-3 whitespace-nowrap">Stock Status</th>

              {!readOnly && (
                <th className="py-3.5 pl-3 pr-5 whitespace-nowrap text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EEF2F6] text-[12.5px] text-[#30465B]">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 8 : 9}
                  className="py-14 px-6 text-center"
                >
                  <div className="max-w-90 mx-auto flex flex-col items-center">
                    <span className="w-10 h-10 rounded-2xl bg-[#F7F9FA] border border-[#E8EEF4] text-[#8998A5] flex items-center justify-center mb-3">
                      <PackageSearch className="w-5 h-5" strokeWidth={1.8} />
                    </span>

                    <p className="text-[13px] font-semibold text-[#30465B]">
                      Tidak ada produk yang ditemukan
                    </p>

                    <p className="mt-1 text-[12px] text-[#8998A5] leading-relaxed">
                      Coba ubah kata kunci pencarian atau sesuaikan filter
                      kategori dan status stok.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const stockStatus = getProductStockStatus(product);
                const badgeStyle = getStockBadgeStyle(stockStatus);
                const stockValue = Number(product?.current_stock ?? 0);

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FAFBFD] transition-colors"
                  >
                    <td className="py-3.5 pl-5 pr-3 font-medium text-[#527DA3] whitespace-nowrap">
                      {product.sku}
                    </td>

                    <td className="py-3.5 px-3 max-w-60">
                      <div className="font-semibold text-[#30465B] truncate">
                        {product.name}
                      </div>

                      {product.description ? (
                        <div className="text-[11px] text-[#8998A5] truncate mt-0.5">
                          {product.description}
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-3 text-[#637587] whitespace-nowrap">
                      {product.category_name || "-"}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-[#30465B] text-right whitespace-nowrap tabular-nums">
                      {stockValue.toLocaleString("id-ID")}
                    </td>

                    <td className="py-3.5 px-3 text-[#637587] whitespace-nowrap">
                      {product.unit || "-"}
                    </td>

                    <td className="py-3.5 px-3 font-medium text-[#30465B] text-right whitespace-nowrap tabular-nums">
                      {formatRupiah(product.selling_price)}
                    </td>

                    <td className="py-3.5 px-3 text-[#637587] whitespace-nowrap">
                      {product.rack_location || "-"}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none ${badgeStyle}`}
                      >
                        {stockStatus}
                      </span>
                    </td>

                    {!readOnly && (
                      <td className="py-3.5 pl-3 pr-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewProduct?.(product)}
                            title={`View details ${product.name}`}
                            aria-label={`View details ${product.name}`}
                            className="w-7 h-7 rounded-lg bg-[#F7F9FA] hover:bg-[#EDF2F7] border border-[#E8EEF4] text-[#637587] inline-flex items-center justify-center cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditProduct?.(product)}
                            title={`Edit ${product.name}`}
                            aria-label={`Edit ${product.name}`}
                            className="w-7 h-7 rounded-lg bg-[#F7F9FA] hover:bg-[#EDF2F7] border border-[#E8EEF4] text-[#637587] inline-flex items-center justify-center cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteProduct?.(product)}
                            title={`Delete ${product.name}`}
                            aria-label={`Delete ${product.name}`}
                            className="w-7 h-7 rounded-lg bg-[#F7F9FA] hover:bg-[#FDECEC] border border-[#E8EEF4] text-[#637587] inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
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
            ? "Showing 0 of 0 products"
            : `Showing ${startIndex}–${endIndex} of ${safeTotalFiltered} products`}
        </p>

        <nav
          aria-label="Pagination produk"
          className="inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <button
            type="button"
            disabled={safeCurrentPage <= 1 || safeTotalFiltered === 0}
            onClick={() =>
              onPageChange?.(Math.max(1, safeCurrentPage - 1))
            }
            aria-label="Halaman sebelumnya"
            className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#30465B] hover:bg-[#F7F9FA] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {paginationItems.map((item, idx) => {
            if (typeof item === "string") {
              return (
                <span
                  key={`${item}-${idx}`}
                  className="px-1.5 text-[12px] text-[#8998A5]"
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
                className={`min-w-8 h-8 px-2 rounded-lg text-[12px] font-semibold cursor-pointer ${
                  isActivePage
                    ? "bg-[#2D4356] text-white"
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
            className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#30465B] hover:bg-[#F7F9FA] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
