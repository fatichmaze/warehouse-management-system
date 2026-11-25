import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { isValidHttpOrHttpsUrl } from "@/lib/product-form-helpers";
import { formatDateDisplay, formatRupiah } from "./productDetailsHelpers";

function ProductInfoField({ label, children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-[#EEF2F6] bg-[#FAFBFD] p-3.5 ${className}`.trim()}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8998A5]">
        {label}
      </p>
      {children}
    </div>
  );
}

function ProductImagePreview({ imageUrl, alt }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!isValidHttpOrHttpsUrl(imageUrl) || hasImageError) {
    return (
      <div className="space-y-1.5 text-center">
        <Package
          className="mx-auto h-8 w-8 text-[#8998A5]"
          strokeWidth={1.6}
        />

        <p className="text-[12px] font-medium text-[#637587]">
          Tidak ada gambar produk
        </p>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={600}
      height={400}
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setHasImageError(true)}
      className="max-h-44 w-full rounded-xl object-contain"
    />
  );
}

export default function ProductInfoSection({
  product,
  safeCurrentStock,
  safeMinStock,
  safeLowStock,
}) {
  const imageUrl = product?.image_url ?? "";

  return (
    <section className="space-y-5 rounded-2xl border border-[#E8EEF4] bg-white p-6 shadow-[0_2px_10px_rgba(48,70,91,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F6] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8EEF4] bg-[#F7F9FA] text-[#527DA3]">
            <Package className="h-4 w-4" strokeWidth={1.9} />
          </span>

          <h2
            className="text-[18px] font-bold text-[#30465B]"
            style={{
              fontFamily: "var(--font-bricolage), sans-serif",
            }}
          >
            Informasi Lengkap Produk
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-[#E8EEF4] bg-[#F7F9FA] p-4">
          <ProductImagePreview
            key={imageUrl}
            imageUrl={imageUrl}
            alt={product?.name || "Gambar produk"}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 text-[12.5px] sm:grid-cols-2 md:grid-cols-3 lg:col-span-2">
          <ProductInfoField label="SKU">
            <p className="mt-1 font-semibold text-[#527DA3]">
              {product?.sku || "-"}
            </p>
          </ProductInfoField>

          <ProductInfoField label="Kategori">
            <p className="mt-1 font-semibold text-[#30465B]">
              {product?.category_name || "-"}
            </p>
          </ProductInfoField>

          <ProductInfoField label="Lokasi Rak">
            <p className="mt-1 font-semibold text-[#30465B]">
              {product?.rack_location || "-"}
            </p>
          </ProductInfoField>

          <ProductInfoField label="Stok Saat Ini">
            <p className="mt-1 font-bold tabular-nums text-[#30465B]">
              {safeCurrentStock.toLocaleString("id-ID")}{" "}
              <span className="font-medium text-[#637587]">
                {product?.unit || ""}
              </span>
            </p>
          </ProductInfoField>

          <ProductInfoField label="Stok Minimum (Severe)">
            <p className="mt-1 font-semibold tabular-nums text-[#30465B]">
              {safeMinStock.toLocaleString("id-ID")}{" "}
              <span className="font-normal text-[#637587]">
                {product?.unit || ""}
              </span>
            </p>
          </ProductInfoField>

          <ProductInfoField label="Batas Stok Low">
            <p className="mt-1 font-semibold tabular-nums text-[#30465B]">
              {safeLowStock.toLocaleString("id-ID")}{" "}
              <span className="font-normal text-[#637587]">
                {product?.unit || ""}
              </span>
            </p>
          </ProductInfoField>

          <ProductInfoField label="Harga Beli">
            <p className="mt-1 font-semibold tabular-nums text-[#30465B]">
              {formatRupiah(product?.purchase_price)}
            </p>
          </ProductInfoField>

          <ProductInfoField label="Harga Jual">
            <p className="mt-1 font-semibold tabular-nums text-[#30465B]">
              {formatRupiah(product?.selling_price)}
            </p>
          </ProductInfoField>

          <ProductInfoField label="Tanggal Dibuat">
            <p className="mt-1 font-medium text-[#30465B]">
              {formatDateDisplay(product?.created_at)}
            </p>
          </ProductInfoField>

          <ProductInfoField
            label="Deskripsi"
            className="sm:col-span-2 md:col-span-3"
          >
            <p className="mt-1 leading-relaxed text-[#637587]">
              {product?.description || "Tidak ada deskripsi produk."}
            </p>
          </ProductInfoField>
        </div>
      </div>
    </section>
  );
}