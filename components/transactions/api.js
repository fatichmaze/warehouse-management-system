export async function callApi(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Terjadi kesalahan.");
  }

  return data;
}

// Mengubah YYYY-MM-DD menjadi format tanggal Indonesia.
export function formatDateId(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return "-";
  }

  const [y, m, d] = iso.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
