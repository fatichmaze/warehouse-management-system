"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  Layers,
  FolderX,
  X,
  CheckCircle2,
} from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import CategoryTable from "@/components/dashboard/admin/categories/CategoryTable";
import AddCategoryModal from "@/components/dashboard/admin/categories/AddCategoryModal";
import EditCategoryModal from "@/components/dashboard/admin/categories/EditCategoryModal";
import DeleteCategoryModal from "@/components/dashboard/admin/categories/DeleteCategoryModal";

const PAGE_SIZE = 6;

export default function AdminCategoriesClient({
  userName = "Admin Tataloka",
  userRole = "",
  initialCategories = [],
}) {
  const [categories, setCategories] = useState(() =>
    Array.isArray(initialCategories) ? initialCategories : []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const normalizedSummary = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const totalCategories = list.length;
    const categoriesWithProducts = list.filter(
      (cat) => Number(cat?.product_count ?? 0) > 0
    ).length;
    const emptyCategories = list.filter(
      (cat) => Number(cat?.product_count ?? 0) <= 0
    ).length;

    return {
      totalCategories,
      categoriesWithProducts,
      emptyCategories,
    };
  }, [categories]);

  function handleSearchChange(value) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleFilterChange(value) {
    setFilterMode(value);
    setCurrentPage(1);
  }

  function handleOpenAddModal() {
    setIsAddModalOpen(true);
  }

  function handleCloseAddModal() {
    setIsAddModalOpen(false);
  }

  function handleAddSuccess(result) {
    const createdItem = result?.data;
    if (createdItem && typeof createdItem === "object") {
      setCategories((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const exists = list.some(
          (item) => item?.id !== undefined && item?.id === createdItem?.id
        );
        if (exists) {
          return list.map((item) =>
            item?.id === createdItem?.id ? { ...item, ...createdItem } : item
          );
        }
        return [...list, createdItem];
      });
    }

    setSearchQuery("");
    setFilterMode("all");
    setCurrentPage(1);
    setSuccessMessage(result?.message || "Kategori berhasil ditambahkan.");
  }

  function handleOpenEditModal(category) {
    if (!category || typeof category !== "object") return;
    setEditingCategory(category);
  }

  function handleCloseEditModal() {
    setEditingCategory(null);
  }

  function handleEditSuccess(result) {
    const updatedItem = result?.data;
    const targetId = updatedItem?.id ?? editingCategory?.id;

    if (targetId !== undefined && targetId !== null) {
      setCategories((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.map((item) => {
          if (item?.id !== targetId) return item;
          return updatedItem && typeof updatedItem === "object"
            ? { ...item, ...updatedItem }
            : item;
        });
      });
    }

    setSuccessMessage(result?.message || "Kategori berhasil diperbarui.");
  }

  function handleOpenDeleteModal(category) {
    if (!category || typeof category !== "object") return;
    setDeleteErrorMessage(null);
    setDeletingCategory(category);
  }

  function handleCloseDeleteModal() {
    if (isDeleting) return;
    setDeleteErrorMessage(null);
    setDeletingCategory(null);
  }

  async function handleConfirmDeleteCategory(categoryToDelete) {
    if (isDeleting) return;
    const targetCategory = categoryToDelete ?? deletingCategory;
    const targetId = targetCategory?.id;

    if (targetId === undefined || targetId === null || targetId === "") {
      setDeleteErrorMessage("ID kategori tidak valid.");
      return;
    }

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/categories/${targetId}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDeleteErrorMessage(
          result?.error ||
            "Gagal menghapus kategori. Silakan coba lagi."
        );
        return;
      }

      setCategories((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.filter((item) => item?.id !== targetId);
      });

      setDeleteErrorMessage(null);
      setDeletingCategory(null);
      setSuccessMessage(result?.message || "Kategori berhasil dihapus.");
    } catch {
      setDeleteErrorMessage(
        "Terjadi gangguan jaringan saat menghubungi server."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return list.filter((category) => {
      if (normalizedQuery) {
        const catName = String(category?.name ?? "").toLowerCase();
        if (!catName.includes(normalizedQuery)) {
          return false;
        }
      }

      const productCount = Number(category?.product_count ?? 0);
      if (filterMode === "with_products") {
        return productCount > 0;
      }
      if (filterMode === "empty") {
        return productCount <= 0;
      }
      return true;
    });
  }, [categories, searchQuery, filterMode]);

  const totalFilteredCount = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedCategories = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredCategories.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredCategories, safeCurrentPage]);

  const normalizedRole = String(userRole ?? "").toLowerCase();

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar pendingCount={0} role={userRole} />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar
            adminName={userName}
            role={userRole}
            currentSection="Categories"
          />

          <main className="flex-1 px-7 pt-3 pb-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1
                  className="text-[34px] leading-[1.12] font-bold tracking-tight text-[#30465B]"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Category Management
                </h1>
                <p className="mt-1 text-[12px] leading-relaxed text-[#8998A5]">
                  Kelola kategori produk untuk mengelompokkan barang di gudang Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddModal}
                aria-label="Add Category"
                data-role={normalizedRole}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4356] hover:bg-[#233544] text-white text-[12.5px] font-semibold shadow-[0_6px_16px_rgba(45,67,86,0.18)] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Add Category</span>
              </button>
            </div>

            {successMessage ? (
              <div
                role="status"
                className="rounded-2xl bg-[#ECFDF3] border border-[#ABEFC6] px-4 py-3 flex items-center justify-between gap-3 text-[12.5px] font-medium text-[#067647]"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Tutup notifikasi"
                  className="p-1 rounded-lg hover:bg-[#DCFAE6] text-[#067647] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-[#E8EEF4] shadow-[0_2px_10px_rgba(48,70,91,0.04)] px-5 py-4 flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-[#F7F9FA] border border-[#E8EEF4] text-[#527DA3] inline-flex items-center justify-center shrink-0">
                  <FolderOpen className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[11.5px] font-medium text-[#8998A5]">
                    Total Categories
                  </p>
                  <p
                    className="text-[26px] leading-tight font-bold text-[#30465B] tabular-nums"
                    style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                  >
                    {normalizedSummary.totalCategories.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#E8EEF4] shadow-[0_2px_10px_rgba(48,70,91,0.04)] px-5 py-4 flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-[#F7F9FA] border border-[#E8EEF4] text-[#2F855A] inline-flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[11.5px] font-medium text-[#8998A5]">
                    Categories with Products
                  </p>
                  <p
                    className="text-[26px] leading-tight font-bold text-[#30465B] tabular-nums"
                    style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                  >
                    {normalizedSummary.categoriesWithProducts.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#2D4356] border border-[#2D4356] shadow-[0_6px_16px_rgba(45,67,86,0.16)] px-5 py-4 flex items-center gap-4 text-white">
                <span className="w-10 h-10 rounded-xl bg-white/10 text-white inline-flex items-center justify-center shrink-0">
                  <FolderX className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[11.5px] font-medium text-white/75">
                    Empty Categories
                  </p>
                  <p
                    className="text-[26px] leading-tight font-bold text-white tabular-nums"
                    style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                  >
                    {normalizedSummary.emptyCategories.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[#E8EEF4] shadow-[0_2px_10px_rgba(48,70,91,0.04)] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="w-4 h-4 text-[#8998A5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.9}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari kategori..."
                  aria-label="Cari kategori berdasarkan nama"
                  className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-[#F7F9FA] border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:bg-white focus:border-[#527DA3] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <label htmlFor="category-filter-select" className="sr-only">
                  Filter kategori
                </label>
                <select
                  id="category-filter-select"
                  value={filterMode}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="h-10 px-3.5 rounded-xl bg-[#F7F9FA] border border-[#E2E8F0] text-[12.5px] font-medium text-[#30465B] focus:outline-none focus:bg-white focus:border-[#527DA3] transition-colors cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="with_products">With Products</option>
                  <option value="empty">Empty Categories</option>
                </select>
              </div>
            </div>

            <CategoryTable
              categories={paginatedCategories}
              hasAnyCategories={categories.length > 0}
              searchQuery={searchQuery}
              filterMode={filterMode}
              totalFilteredCount={totalFilteredCount}
              currentPage={safeCurrentPage}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              onEditCategory={handleOpenEditModal}
              onDeleteCategory={handleOpenDeleteModal}
            />
          </main>
        </div>
      </div>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
      />

      <EditCategoryModal
        isOpen={Boolean(editingCategory)}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        category={editingCategory}
      />

      <DeleteCategoryModal
        isOpen={Boolean(deletingCategory)}
        category={deletingCategory}
        isDeleting={isDeleting}
        errorMessage={deleteErrorMessage}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteCategory}
      />
    </div>
  );
}