export function getProductStockStatus(product) {
  const currentStock = Number(product?.current_stock ?? 0);
  const minStock = Number(product?.min_stock ?? 0);
  const lowStock = Number(product?.low_stock ?? 0);

  if (currentStock === 0) {
    return "Out of Stock";
  }

  if (currentStock <= minStock) {
    return "Severe";
  }

  if (currentStock <= lowStock) {
    return "Low";
  }

  return "Normal";
}

export function getStockBadgeStyle(status) {
  switch (status) {
    case "Out of Stock":
      return "bg-[#2D4356] text-white";
    case "Severe":
      return "bg-[#FDECEC] text-[#C53030]";
    case "Low":
      return "bg-[#FEF5E7] text-[#D9822B]";
    case "Normal":
    default:
      return "bg-[#EAF6EE] text-[#2F855A]";
  }
}

export function formatRupiah(value) {
  const numericValue = Number(value ?? 0);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  return `Rp ${Math.round(safeValue).toLocaleString("id-ID")}`;
}

export function formatDateDisplay(value) {
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

export function formatTransactionType(type) {
  const normalized = String(type ?? "").toLowerCase();

  if (
    normalized === "incoming" ||
    normalized === "in" ||
    normalized === "barang_masuk"
  ) {
    return "Barang Masuk";
  }

  if (
    normalized === "outgoing" ||
    normalized === "out" ||
    normalized === "barang_keluar"
  ) {
    return "Barang Keluar";
  }

  return type || "-";
}

export function getTransactionStatusStyle(status) {
  const normalized = String(status ?? "").toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "shipped" ||
    normalized === "completed"
  ) {
    return "bg-[#EAF6EE] text-[#2F855A]";
  }

  if (
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "failed"
  ) {
    return "bg-[#FDECEC] text-[#C53030]";
  }

  if (normalized === "pending") {
    return "bg-[#FEF5E7] text-[#D9822B]";
  }

  return "bg-[#F7F9FA] text-[#637587]";
}