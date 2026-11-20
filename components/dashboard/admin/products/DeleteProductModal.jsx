"use client";

import { useEffect } from "react";
import { X, Loader2, AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteProductModal({
  isOpen = false,
  product = null,
  onClose,
  onConfirm,
  isDeleting = false,
  error = null,
}) {
  const currentStockNum = Number(product?.current_stock ?? 0);
  const safeCurrentStock = Number.isFinite(currentStockNum)
    ? currentStockNum
    : 0;
  const hasStock = safeCurrentStock > 0;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isDeleting) {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  function handleClose() {
    if (isDeleting) return;
    onClose?.();
  }

  function handleBackdropClick() {
    if (isDeleting) return;
    onClose?.();
  }

  function handleConfirmClick() {
    if (isDeleting || !product) return;
    onConfirm?.(product);
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2D3C]/45 backdrop-blur-[2px] p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-modal-title"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white border border-[#E8EEF4] shadow-[0_20px_48px_rgba(48,70,91,0.18)] overflow-hidden my-auto"
      >
        <div className="px-6 py-4.5 border-b border-[#E8EEF4] flex items-center justify-between gap-4 bg-[#FAFBFD]">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#FDECEC] border border-[#F5C2C2] text-[#C53030] inline-flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </span>
            <div>
              <h2
                id="delete-product-modal-title"
                className="text-[20px] leading-tight font-bold text-[#30465B]"
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                Delete Product
              </h2>
              <p className="mt-0.5 text-[12px] text-[#8998A5]">
                Konfirmasi penghapusan data produk dari katalog gudang.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-xl border border-[#E2E8F0] bg-white text-[#637587] hover:text-[#30465B] hover:bg-[#F7F9FA] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error ? (
            <div
              role="alert"
              className="rounded-xl bg-[#FDECEC] border border-[#F5C2C2] px-4 py-2.5 text-[12px] font-medium text-[#C53030]"
            >
              {error}
            </div>
          ) : null}

          <p className="text-[12.5px] leading-relaxed text-[#637587]">
            Apakah Anda yakin ingin menghapus produk berikut? Tindakan ini tidak
            dapat dibatalkan.
          </p>

          <div className="rounded-2xl bg-[#F7F9FA] border border-[#E8EEF4] p-4 space-y-2.5 text-[12.5px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8998A5]">SKU</span>
              <span className="font-semibold text-[#527DA3] tabular-nums">
                {product.sku || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8998A5]">Product Name</span>
              <span className="font-semibold text-[#30465B] text-right">
                {product.name || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8998A5]">Current Stock</span>
              <span className="font-semibold text-[#30465B] tabular-nums">
                {safeCurrentStock.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8998A5]">Unit</span>
              <span className="font-medium text-[#30465B]">
                {product.unit || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8998A5]">Rack Location</span>
              <span className="font-medium text-[#30465B]">
                {product.rack_location || "-"}
              </span>
            </div>
          </div>

          {hasStock ? (
            <div
              role="alert"
              className="rounded-xl bg-[#FEF5E7] border border-[#F7D7A8] px-4 py-3 flex items-start gap-2.5 text-[12px] text-[#B76E1E]"
            >
              <AlertTriangle
                className="w-4 h-4 mt-0.5 shrink-0 text-[#D9822B]"
                strokeWidth={2}
              />
              <div className="leading-relaxed">
                <span className="font-semibold">Peringatan Stok Tersisa:</span>{" "}
                Produk ini masih memiliki stok sebanyak{" "}
                <span className="font-semibold tabular-nums">
                  {safeCurrentStock.toLocaleString("id-ID")}{" "}
                  {product.unit || ""}
                </span>{" "}
                di rak{" "}
                <span className="font-semibold">
                  {product.rack_location || "-"}
                </span>
                . Pastikan Anda sudah memeriksa kondisi stok sebelum
                mengonfirmasi penghapusan.
              </div>
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-[#E8EEF4] bg-[#FAFBFD] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F7F9FA] text-[#30465B] text-[12.5px] font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#C53030] hover:bg-[#A82424] text-white text-[12.5px] font-semibold shadow-[0_6px_16px_rgba(197,48,48,0.2)] disabled:opacity-60 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Product</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}