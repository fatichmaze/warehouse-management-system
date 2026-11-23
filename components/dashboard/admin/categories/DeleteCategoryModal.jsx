"use client";

import { useEffect } from "react";
import { X, Trash2 } from "lucide-react";

export default function DeleteCategoryModal({
  isOpen = false,
  category = null,
  isDeleting = false,
  errorMessage = null,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isDeleting) {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !category) {
    return null;
  }

  function handleRequestClose() {
    if (isDeleting) return;
    onClose?.();
  }

  function handleConfirmClick() {
    if (isDeleting) return;
    onConfirm?.(category);
  }

  const categoryName = category?.name || "kategori ini";
  const productCount = Number(category?.product_count ?? 0);
  const safeProductCount = Number.isFinite(productCount) ? productCount : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-category-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2E3D]/45 backdrop-blur-[2px] p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleRequestClose();
        }
      }}
    >
      <div
        className="w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col rounded-3xl bg-white border border-[#E8EEF4] shadow-[0_24px_60px_rgba(30,46,61,0.22)] overflow-hidden"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <div className="shrink-0 px-6 py-4.5 border-b border-[#EEF2F6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#FDECEC] border border-[#F5C2C2] text-[#C53030] inline-flex items-center justify-center">
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </span>
            <div>
              <h2
                id="delete-category-modal-title"
                className="text-[18px] font-bold text-[#30465B] leading-tight"
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                Delete Category
              </h2>
              <p className="text-[11.5px] text-[#8998A5]">
                Konfirmasi penghapusan kategori yang dipilih.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            disabled={isDeleting}
            aria-label="Tutup modal hapus kategori"
            className="w-8 h-8 rounded-xl bg-[#F7F9FA] hover:bg-[#EDF2F7] text-[#637587] hover:text-[#30465B] inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-xl bg-[#FDECEC] border border-[#F5C2C2] px-4 py-2.5 text-[12px] font-medium text-[#C53030]"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="rounded-2xl bg-[#F7F9FA] border border-[#E8EEF4] p-4 space-y-1.5">
            <p className="text-[12.5px] text-[#30465B] leading-relaxed">
              Apakah Anda yakin ingin menghapus kategori{" "}
              <span className="font-semibold text-[#30465B]">
                “{categoryName}”
              </span>
              ?
            </p>
            <p className="text-[11.5px] text-[#8998A5]">
              Produk terkait saat ini:{" "}
              <span className="font-semibold text-[#30465B] tabular-nums">
                {safeProductCount.toLocaleString("id-ID")} produk
              </span>
              . Kategori hanya dapat dihapus jika tidak memiliki produk.
            </p>
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-[#EEF2F6] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={handleRequestClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 h-10 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F7F9FA] text-[12.5px] font-semibold text-[#637587] hover:text-[#30465B] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 h-10 rounded-xl bg-[#C53030] hover:bg-[#A62626] text-white text-[12.5px] font-semibold shadow-[0_6px_16px_rgba(197,48,48,0.22)] transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isDeleting ? "Menghapus..." : "Hapus Kategori"}
          </button>
        </div>
      </div>
    </div>
  );
}