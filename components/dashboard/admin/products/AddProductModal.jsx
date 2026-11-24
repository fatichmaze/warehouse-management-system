"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

const INITIAL_FORM_STATE = {
  sku: "",
  name: "",
  category_id: "",
  description: "",
  purchase_price: "",
  selling_price: "",
  min_stock: "",
  low_stock: "",
  current_stock: "0",
  unit: "",
  rack_location: "",
  image_url: "",
};

function isValidHttpOrHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AddProductModal({
  categories = [],
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [validationError, setValidationError] = useState("");

  const hasCategories = Array.isArray(categories) && categories.length > 0;

  function handleFieldChange(fieldName, value) {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    if (validationError) {
      setValidationError("");
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    setValidationError("");
    onClose?.();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!hasCategories) {
      setValidationError(
        "Belum ada kategori yang tersedia. Tambahkan kategori terlebih dahulu sebelum menambahkan produk."
      );
      return;
    }

    const skuTrimmed = formData.sku.trim().toUpperCase();
    const nameTrimmed = formData.name.trim();
    const unitTrimmed = formData.unit.trim();
    const rackTrimmed = formData.rack_location.trim();
    const categoryIdNum = Number(formData.category_id);

    const purchasePriceNum = Number(formData.purchase_price);
    const sellingPriceNum = Number(formData.selling_price);
    const minStockNum = Number(formData.min_stock);
    const lowStockNum = Number(formData.low_stock);
    const currentStockNum =
      formData.current_stock === "" ? 0 : Number(formData.current_stock);

    const imageUrlTrimmed = formData.image_url.trim();

    if (!skuTrimmed || !nameTrimmed || !unitTrimmed || !rackTrimmed) {
      setValidationError(
        "SKU, Product Name, Unit, dan Rack Location wajib diisi."
      );
      return;
    }

    if (!Number.isInteger(categoryIdNum) || categoryIdNum <= 0) {
      setValidationError("Silakan pilih kategori produk terlebih dahulu.");
      return;
    }

    const isCategoryInList = categories.some(
      (cat) => Number(cat?.id) === categoryIdNum
    );
    if (!isCategoryInList) {
      setValidationError(
        "Kategori yang dipilih tidak ditemukan dalam daftar kategori yang tersedia."
      );
      return;
    }

    if (
      formData.purchase_price === "" ||
      !Number.isFinite(purchasePriceNum) ||
      purchasePriceNum < 0
    ) {
      setValidationError("Purchase Price harus berupa angka 0 atau lebih.");
      return;
    }

    if (
      formData.selling_price === "" ||
      !Number.isFinite(sellingPriceNum) ||
      sellingPriceNum < 0
    ) {
      setValidationError("Selling Price harus berupa angka 0 atau lebih.");
      return;
    }

    if (
      formData.min_stock === "" ||
      !Number.isInteger(minStockNum) ||
      minStockNum < 0
    ) {
      setValidationError(
        "Minimum Stock harus berupa bilangan bulat 0 atau lebih."
      );
      return;
    }

    if (formData.low_stock === "" || !Number.isInteger(lowStockNum)) {
      setValidationError(
        "Low Stock Threshold harus berupa bilangan bulat yang valid."
      );
      return;
    }

    if (!(lowStockNum > minStockNum)) {
      setValidationError(
        "Low Stock Threshold harus lebih besar dari Minimum Stock."
      );
      return;
    }

    if (
      !Number.isInteger(currentStockNum) ||
      currentStockNum < 0
    ) {
      setValidationError(
        "Current Stock harus berupa bilangan bulat 0 atau lebih."
      );
      return;
    }

    if (imageUrlTrimmed !== "" && !isValidHttpOrHttpsUrl(imageUrlTrimmed)) {
      setValidationError(
        "Image URL harus berupa URL valid yang diawali http:// atau https://."
      );
      return;
    }

    setValidationError("");

    const payload = {
      sku: skuTrimmed,
      name: nameTrimmed,
      category_id: categoryIdNum,
      description: formData.description.trim() || null,
      purchase_price: purchasePriceNum,
      selling_price: sellingPriceNum,
      min_stock: minStockNum,
      low_stock: lowStockNum,
      current_stock: currentStockNum,
      unit: unitTrimmed,
      rack_location: rackTrimmed,
      image_url: imageUrlTrimmed || null,
    };

    onSubmit?.(payload);
  }

  const displayedError = validationError || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2D3C]/45 backdrop-blur-[2px] p-2.5 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-modal-title"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white border border-[#E8EEF4] shadow-[0_20px_48px_rgba(48,70,91,0.18)] overflow-hidden my-auto">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-[#E8EEF4] flex items-start sm:items-center justify-between gap-3 sm:gap-4 bg-[#FAFBFD]">
          <div className="min-w-0">
            <h2
              id="add-product-modal-title"
              className="text-[18px] sm:text-[20px] leading-tight font-bold text-[#30465B]"
              style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
            >
              Add New Product
            </h2>
            <p className="mt-0.5 text-[11.5px] sm:text-[12px] text-[#8998A5] leading-snug">
              Lengkapi detail produk dan batas stok gudang. Tanda{" "}
              <span className="text-[#C53030] font-semibold">*</span>{" "}
              menandakan field wajib.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-xl border border-[#E2E8F0] bg-white text-[#637587] hover:text-[#30465B] hover:bg-[#F7F9FA] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} noValidate>
          <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[68vh] sm:max-h-[72vh] overflow-y-auto">
            {!hasCategories ? (
              <div
                role="status"
                className="rounded-xl bg-[#FEF5E7] border border-[#F7D7A8] px-3.5 sm:px-4 py-2.5 text-[12px] font-medium text-[#B76E1E]"
              >
                Belum ada kategori yang tersedia. Silakan tambahkan kategori terlebih dahulu sebelum menambahkan produk.
              </div>
            ) : null}

            {displayedError ? (
              <div
                role="alert"
                className="rounded-xl bg-[#FDECEC] border border-[#F5C2C2] px-3.5 sm:px-4 py-2.5 text-[12px] font-medium text-[#C53030]"
              >
                {displayedError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="min-w-0">
                <label
                  htmlFor="product-sku"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  SKU <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-sku"
                  name="sku"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={formData.sku}
                  onChange={(e) => handleFieldChange("sku", e.target.value)}
                  placeholder="Contoh: PRD-050"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="product-name"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Product Name <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Nama produk"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="min-w-0">
                <label
                  htmlFor="product-category-id"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Category <span className="text-[#C53030]">*</span>
                </label>
                <select
                  id="product-category-id"
                  name="category_id"
                  required
                  disabled={isSubmitting || !hasCategories}
                  value={formData.category_id}
                  onChange={(e) =>
                    handleFieldChange("category_id", e.target.value)
                  }
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#30465B] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors"
                >
                  <option value="">
                    {hasCategories ? "Pilih kategori" : "Tidak ada kategori"}
                  </option>
                  {hasCategories
                    ? categories.map((cat) => (
                        <option key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </option>
                      ))
                    : null}
                </select>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="product-unit"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Unit <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-unit"
                  name="unit"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={formData.unit}
                  onChange={(e) => handleFieldChange("unit", e.target.value)}
                  placeholder="Contoh: Pcs, Dus, Box, Kg"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="product-description"
                className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
              >
                Description
              </label>
              <textarea
                id="product-description"
                name="description"
                rows={2}
                disabled={isSubmitting}
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder="Catatan atau spesifikasi singkat produk (opsional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="min-w-0">
                <label
                  htmlFor="product-purchase-price"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Purchase Price <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-purchase-price"
                  name="purchase_price"
                  type="number"
                  step="any"
                  min="0"
                  required
                  disabled={isSubmitting}
                  value={formData.purchase_price}
                  onChange={(e) =>
                    handleFieldChange("purchase_price", e.target.value)
                  }
                  placeholder="0"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors tabular-nums"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="product-selling-price"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Selling Price <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-selling-price"
                  name="selling_price"
                  type="number"
                  step="any"
                  min="0"
                  required
                  disabled={isSubmitting}
                  value={formData.selling_price}
                  onChange={(e) =>
                    handleFieldChange("selling_price", e.target.value)
                  }
                  placeholder="0"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div className="min-w-0">
                <label
                  htmlFor="product-min-stock"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Minimum Stock <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-min-stock"
                  name="min_stock"
                  type="number"
                  step="1"
                  min="0"
                  required
                  disabled={isSubmitting}
                  value={formData.min_stock}
                  onChange={(e) =>
                    handleFieldChange("min_stock", e.target.value)
                  }
                  placeholder="0"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors tabular-nums"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="product-low-stock"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Low Stock Threshold <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-low-stock"
                  name="low_stock"
                  type="number"
                  step="1"
                  required
                  disabled={isSubmitting}
                  value={formData.low_stock}
                  onChange={(e) =>
                    handleFieldChange("low_stock", e.target.value)
                  }
                  placeholder="Harus > Minimum Stock"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors tabular-nums"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="product-current-stock"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Current Stock <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-current-stock"
                  name="current_stock"
                  type="number"
                  step="1"
                  min="0"
                  required
                  disabled={isSubmitting}
                  value={formData.current_stock}
                  onChange={(e) =>
                    handleFieldChange("current_stock", e.target.value)
                  }
                  placeholder="0"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="min-w-0">
                <label
                  htmlFor="product-rack-location"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Rack Location <span className="text-[#C53030]">*</span>
                </label>
                <input
                  id="product-rack-location"
                  name="rack_location"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={formData.rack_location}
                  onChange={(e) =>
                    handleFieldChange("rack_location", e.target.value)
                  }
                  placeholder="Contoh: A-01-03"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="product-image-url"
                  className="block text-[12px] font-semibold text-[#30465B] mb-1.5"
                >
                  Image URL
                </label>
                <input
                  id="product-image-url"
                  name="image_url"
                  type="url"
                  disabled={isSubmitting}
                  value={formData.image_url}
                  onChange={(e) =>
                    handleFieldChange("image_url", e.target.value)
                  }
                  placeholder="https://... (opsional)"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:border-[#527DA3] disabled:bg-[#F7F9FA] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#E8EEF4] bg-[#FAFBFD] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F7F9FA] text-[#30465B] text-[12.5px] font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2D4356] hover:bg-[#233544] text-white text-[12.5px] font-semibold shadow-[0_6px_16px_rgba(45,67,86,0.18)] disabled:opacity-60 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Add Product</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}