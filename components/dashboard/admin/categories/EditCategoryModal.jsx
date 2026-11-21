"use client";

import { useState, useEffect, useRef } from "react";
import { X, Pencil } from "lucide-react";

function isValidHttpOrHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getCategoryId(category) {
  if (!category || typeof category !== "object" || Array.isArray(category)) {
    return null;
  }
  const rawId = category.id;
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

export default function EditCategoryModal({
  isOpen = false,
  onClose,
  onSuccess,
  category = null,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const prevOpenAndCategoryRef = useRef({ wasOpen: false, categoryId: null });

  const categoryId = getCategoryId(category);
  const categoryName = typeof category?.name === "string" ? category.name : "";
  const categoryDescription =
    typeof category?.description === "string" ? category.description : "";
  const categoryImageUrl =
    typeof category?.image_url === "string" ? category.image_url : "";

  useEffect(() => {
    const prev = prevOpenAndCategoryRef.current;
    const justOpenedOrSwitched =
      isOpen && (!prev.wasOpen || prev.categoryId !== categoryId);

    prevOpenAndCategoryRef.current = {
      wasOpen: isOpen,
      categoryId: isOpen ? categoryId : null,
    };

    if (justOpenedOrSwitched) {
      setName(categoryName);
      setDescription(categoryDescription);
      setImageUrl(categoryImageUrl);
      setErrorMessage(null);
    }
  }, [
    isOpen,
    categoryId,
    categoryName,
    categoryDescription,
    categoryImageUrl,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmitting) {
        setErrorMessage(null);
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !categoryId) {
    return null;
  }

  function handleRequestClose() {
    if (isSubmitting) return;
    setErrorMessage(null);
    onClose?.();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Nama kategori wajib diisi dan tidak boleh hanya spasi.");
      return;
    }

    const trimmedDescription = description.trim();
    const trimmedImageUrl = imageUrl.trim();

    if (trimmedImageUrl && !isValidHttpOrHttpsUrl(trimmedImageUrl)) {
      setErrorMessage(
        "URL gambar kategori harus diawali http:// atau https:// dan berformat valid."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      name: trimmedName,
      description: trimmedDescription ? trimmedDescription : null,
      image_url: trimmedImageUrl ? trimmedImageUrl : null,
    };

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(
          result?.error ||
            "Gagal memperbarui kategori. Silakan periksa kembali data."
        );
        return;
      }

      setErrorMessage(null);
      onSuccess?.(result);
      onClose?.();
    } catch {
      setErrorMessage("Terjadi gangguan jaringan saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-category-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2E3D]/45 backdrop-blur-[2px] p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleRequestClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-[#E8EEF4] shadow-[0_24px_60px_rgba(30,46,61,0.22)] overflow-hidden"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <div className="px-6 py-4.5 border-b border-[#EEF2F6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#F7F9FA] border border-[#E8EEF4] text-[#2D4356] inline-flex items-center justify-center">
              <Pencil className="w-4 h-4" strokeWidth={2} />
            </span>
            <div>
              <h2
                id="edit-category-modal-title"
                className="text-[18px] font-bold text-[#30465B] leading-tight"
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                Edit Category
              </h2>
              <p className="text-[11.5px] text-[#8998A5]">
                Perbarui informasi kategori yang dipilih.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            disabled={isSubmitting}
            aria-label="Tutup modal edit kategori"
            className="w-8 h-8 rounded-xl bg-[#F7F9FA] hover:bg-[#EDF2F7] text-[#637587] hover:text-[#30465B] inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-xl bg-[#FDECEC] border border-[#F5C2C2] px-4 py-2.5 text-[12px] font-medium text-[#C53030]"
            >
              {errorMessage}
            </div>
          ) : null}

          <div>
            <label
              htmlFor="edit-category-name-input"
              className="block text-[11.5px] font-semibold text-[#30465B] mb-1.5"
            >
              Nama Kategori <span className="text-[#C53030]">*</span>
            </label>
            <input
              id="edit-category-name-input"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Contoh: Elektronik"
              className="w-full h-10 px-3.5 rounded-xl bg-[#F7F9FA] border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:bg-white focus:border-[#527DA3] disabled:opacity-60 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="edit-category-description-input"
              className="block text-[11.5px] font-semibold text-[#30465B] mb-1.5"
            >
              Deskripsi{" "}
              <span className="text-[#8998A5] font-normal">(Opsional)</span>
            </label>
            <textarea
              id="edit-category-description-input"
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="Tuliskan deskripsi singkat kategori..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FA] border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:bg-white focus:border-[#527DA3] disabled:opacity-60 transition-colors resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="edit-category-image-url-input"
              className="block text-[11.5px] font-semibold text-[#30465B] mb-1.5"
            >
              URL Gambar Kategori{" "}
              <span className="text-[#8998A5] font-normal">(Opsional)</span>
            </label>
            <input
              id="edit-category-image-url-input"
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isSubmitting}
              placeholder="https://example.com/kategori.png"
              className="w-full h-10 px-3.5 rounded-xl bg-[#F7F9FA] border border-[#E2E8F0] text-[12.5px] text-[#30465B] placeholder:text-[#8998A5] focus:outline-none focus:bg-white focus:border-[#527DA3] disabled:opacity-60 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={isSubmitting}
              className="px-4 h-10 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F7F9FA] text-[12.5px] font-semibold text-[#637587] hover:text-[#30465B] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 h-10 rounded-xl bg-[#2D4356] hover:bg-[#233544] text-white text-[12.5px] font-semibold shadow-[0_6px_16px_rgba(45,67,86,0.18)] transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}