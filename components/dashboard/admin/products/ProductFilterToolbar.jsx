"use client";

import { Search, ChevronDown } from "lucide-react";

export const SORT_OPTIONS = [
  { value: "created_desc", label: "Urutkan: Tanggal Ditambahkan (Terbaru)" },
  { value: "created_asc", label: "Urutkan: Tanggal Ditambahkan (Terlama)" },
  { value: "name_asc", label: "Urutkan: Nama Produk (A–Z)" },
  { value: "name_desc", label: "Urutkan: Nama Produk (Z–A)" },
  { value: "stock_asc", label: "Urutkan: Stok Terendah" },
  { value: "stock_desc", label: "Urutkan: Stok Tertinggi" },
];

export const STOCK_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status Stok" },
  { value: "Normal", label: "Normal" },
  { value: "Low", label: "Low" },
  { value: "Severe", label: "Severe" },
  { value: "Out of Stock", label: "Out of Stock" },
];

export default function ProductFilterToolbar({
  searchQuery = "",
  onSearchChange,
  categories = [],
  selectedCategoryId = "all",
  onCategoryChange,
  selectedStockStatus = "all",
  onStockStatusChange,
  sortBy = "created_desc",
  onSortChange,
}) {
  return (
    <div className="rounded-2xl bg-[#F7F9FA] border border-[#E8EEF4] p-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
        <div className="sm:col-span-2 lg:col-span-5 relative">
          <Search
            className="w-4 h-4 text-[#8998A5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.9}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            aria-label="Cari nama produk atau SKU"
            className="w-full h-10 pl-9.5 pr-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] transition-colors"
          />
        </div>

        <div className="lg:col-span-2 relative">
          <select
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            aria-label="Filter kategori"
            className="w-full h-10 appearance-none pl-3.5 pr-8 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#30465B] focus:outline-none focus:border-[#527DA3] transition-colors cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-4 h-4 text-[#8998A5] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.9}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <select
            value={selectedStockStatus}
            onChange={(e) => onStockStatusChange?.(e.target.value)}
            aria-label="Filter status stok"
            className="w-full h-10 appearance-none pl-3.5 pr-8 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#30465B] focus:outline-none focus:border-[#527DA3] transition-colors cursor-pointer"
          >
            {STOCK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-4 h-4 text-[#8998A5] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.9}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            aria-label="Urutkan produk"
            className="w-full h-10 appearance-none pl-3.5 pr-8 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#30465B] focus:outline-none focus:border-[#527DA3] transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-4 h-4 text-[#8998A5] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.9}
          />
        </div>
      </div>
    </div>
  );
}