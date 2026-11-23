"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import ProductSummaryCards from "@/components/dashboard/admin/products/ProductSummaryCards";
import ProductFilterToolbar from "@/components/dashboard/admin/products/ProductFilterToolbar";
import ProductTable from "@/components/dashboard/admin/products/ProductTable";
import AddProductModal from "@/components/dashboard/admin/products/AddProductModal";
import EditProductModal from "@/components/dashboard/admin/products/EditProductModal";
import DeleteProductModal from "@/components/dashboard/admin/products/DeleteProductModal";

const PAGE_SIZE = 6;

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
    return "Low";
  }
  return "Normal";
}

function getCreatedTimestamp(createdAt) {
  if (!createdAt) return 0;
  const time = new Date(createdAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getValidPositiveProductId(product) {
  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return null;
  }
  const rawId = product.id;
  if (typeof rawId === "number") {
    return Number.isInteger(rawId) && rawId > 0 ? rawId : null;
  }
  if (typeof rawId === "string") {
    const trimmed = rawId.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

export default function AdminProductsClient({
  userName = "Admin Tataloka",
  userRole = "",
  initialProducts = [],
  initialCategories = [],
  initialSummary,
}) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(null);

  const normalizedSummary = {
    totalProducts: Number(initialSummary?.totalProducts ?? 0),
    normal: Number(initialSummary?.normal ?? 0),
    lowStock: Number(initialSummary?.lowStock ?? 0),
    severe: Number(initialSummary?.severe ?? 0),
    outOfStock: Number(initialSummary?.outOfStock ?? 0),
  };

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

  const filteredAndSortedProducts = useMemo(() => {
    const productsList = Array.isArray(initialProducts) ? initialProducts : [];
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = productsList.filter((product) => {
      if (normalizedQuery) {
        const productName = String(product?.name ?? "").toLowerCase();
        const productSku = String(product?.sku ?? "").toLowerCase();
        const matchesSearch =
          productName.includes(normalizedQuery) ||
          productSku.includes(normalizedQuery);
        if (!matchesSearch) return false;
      }

      if (selectedCategoryId !== "all") {
        if (String(product?.category_id ?? "") !== String(selectedCategoryId)) {
          return false;
        }
      }

      if (selectedStockStatus !== "all") {
        const status = getProductStockStatus(product);
        if (status !== selectedStockStatus) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const idA = Number(a?.id ?? 0);
      const idB = Number(b?.id ?? 0);

      switch (sortBy) {
        case "name_asc": {
          const cmp = String(a?.name ?? "").localeCompare(
            String(b?.name ?? ""),
            "id",
            { sensitivity: "base" }
          );
          return cmp !== 0 ? cmp : idA - idB;
        }
        case "name_desc": {
          const cmp = String(b?.name ?? "").localeCompare(
            String(a?.name ?? ""),
            "id",
            { sensitivity: "base" }
          );
          return cmp !== 0 ? cmp : idA - idB;
        }
        case "stock_asc": {
          const stockA = Number(a?.current_stock ?? 0);
          const stockB = Number(b?.current_stock ?? 0);
          return stockA !== stockB ? stockA - stockB : idA - idB;
        }
        case "stock_desc": {
          const stockA = Number(a?.current_stock ?? 0);
          const stockB = Number(b?.current_stock ?? 0);
          return stockB !== stockA ? stockB - stockA : idA - idB;
        }
        case "created_asc": {
          const timeA = getCreatedTimestamp(a?.created_at);
          const timeB = getCreatedTimestamp(b?.created_at);
          return timeA !== timeB ? timeA - timeB : idA - idB;
        }
        case "created_desc":
        default: {
          const timeA = getCreatedTimestamp(a?.created_at);
          const timeB = getCreatedTimestamp(b?.created_at);
          return timeB !== timeA ? timeB - timeA : idB - idA;
        }
      }
    });

    return sorted;
  }, [
    initialProducts,
    searchQuery,
    selectedCategoryId,
    selectedStockStatus,
    sortBy,
  ]);

  const totalFilteredCount = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / PAGE_SIZE));

  const safeCurrentPage =
    currentPage > totalPages ? 1 : Math.max(1, currentPage);

  const paginatedProducts = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredAndSortedProducts.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredAndSortedProducts, safeCurrentPage]);

  function handleViewProduct(product) {
    if (isDeleting || isUpdating || isSubmitting) return;
    const validId = getValidPositiveProductId(product);
    if (!validId) return;
    router.push(`/admin/products/${validId}`);
  }

  function handleOpenAddModal() {
    setSubmitError(null);
    setIsAddModalOpen(true);
  }

  function handleCloseAddModal() {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsAddModalOpen(false);
  }

  async function handleCreateProduct(payload) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(
          result?.error || "Gagal menambahkan produk. Silakan periksa kembali data."
        );
        return;
      }

      setSubmitError(null);
      setIsAddModalOpen(false);
      router.refresh();
    } catch {
      setSubmitError("Terjadi gangguan jaringan saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenEditModal(product) {
    if (isUpdating || isDeleting || !product) return;
    setUpdateError(null);
    setEditingProduct(product);
  }

  function handleCloseEditModal() {
    if (isUpdating) return;
    setUpdateError(null);
    setEditingProduct(null);
  }

  async function handleUpdateProduct(payload) {
    if (isUpdating || !editingProduct?.id) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch(
        `/api/admin/products/${editingProduct.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setUpdateError(
          result?.error ||
            "Gagal memperbarui produk. Silakan periksa kembali data."
        );
        return;
      }

      setUpdateError(null);
      setEditingProduct(null);
      router.refresh();
    } catch {
      setUpdateError("Terjadi gangguan jaringan saat menghubungi server.");
    } finally {
      setIsUpdating(false);
    }
  }

  function handleOpenDeleteModal(product) {
    if (isDeleting || isUpdating || isSubmitting) return;
    const validId = getValidPositiveProductId(product);
    if (!validId) return;

    setDeleteError(null);
    setDeletingProduct(product);
  }

  function handleCloseDeleteModal() {
    if (isDeleting) return;
    setDeleteError(null);
    setDeletingProduct(null);
  }

  async function handleConfirmDeleteProduct(targetProduct) {
    if (isDeleting) return;

    const candidate = targetProduct ?? deletingProduct;
    const validId = getValidPositiveProductId(candidate);
    if (!validId) {
      setDeleteError("Data atau ID produk tidak valid untuk dihapus.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/products/${validId}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDeleteError(
          result?.error || "Gagal menghapus produk. Silakan coba lagi."
        );
        return;
      }

      const deletedName =
        result?.data?.name || candidate?.name || `ID #${validId}`;
      const deletedSku = result?.data?.sku || candidate?.sku;
      const label = deletedSku ? `${deletedName} (${deletedSku})` : deletedName;

      setDeleteError(null);
      setDeletingProduct(null);
      setDeleteSuccessMessage(
        result?.message || `Produk ${label} berhasil dihapus.`
      );
      router.refresh();
    } catch {
      setDeleteError("Terjadi gangguan jaringan saat menghubungi server.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar pendingCount={0} role={userRole} />

        <div className="flex-1 min-w-0 w-full max-w-full rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar
            adminName={userName}
            role={userRole}
            currentSection="Products"
          />

          <main className="flex-1 min-w-0 px-4 sm:px-7 pt-3 pb-7 space-y-5">
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
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4356] hover:bg-[#233544] text-white text-[12.5px] font-semibold shadow-[0_6px_16px_rgba(45,67,86,0.18)] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Add Product</span>
              </button>
            </div>

            {deleteSuccessMessage ? (
              <div
                role="status"
                className="rounded-xl bg-[#EAF6EE] border border-[#C6E6D0] px-4 py-2.5 text-[12px] font-medium text-[#2F855A] flex items-center justify-between gap-3"
              >
                <span>{deleteSuccessMessage}</span>
                <button
                  type="button"
                  onClick={() => setDeleteSuccessMessage(null)}
                  className="text-[11.5px] font-semibold underline underline-offset-2 hover:opacity-80 cursor-pointer shrink-0"
                >
                  Tutup
                </button>
              </div>
            ) : null}

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
              onViewProduct={handleViewProduct}
              onEditProduct={handleOpenEditModal}
              onDeleteProduct={handleOpenDeleteModal}
            />
          </main>
        </div>
      </div>

      {isAddModalOpen ? (
        <AddProductModal
          categories={initialCategories}
          onClose={handleCloseAddModal}
          onSubmit={handleCreateProduct}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      ) : null}

      {editingProduct ? (
        <EditProductModal
          key={editingProduct.id}
          product={editingProduct}
          categories={initialCategories}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateProduct}
          isSubmitting={isUpdating}
          error={updateError}
        />
      ) : null}

      <DeleteProductModal
        isOpen={Boolean(deletingProduct)}
        product={deletingProduct}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteProduct}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}