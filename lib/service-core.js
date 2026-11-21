import pool from "@/lib/db";

/**
 * Helper bersama untuk lapisan service (transaksi, restock, dll.).
 *
 * Kode di file ini dipindahkan apa adanya dari lib/transaction-service.js
 * (hanya ditambah kata kunci export) agar dapat dipakai bersama tanpa
 * duplikasi. lib/transaction-service.js tetap mengekspor ulang ServiceError
 * sehingga import yang sudah ada tidak perlu diubah.
 */

export class ServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
}

export async function withTransaction(fn) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/* ---------- Helper validasi ---------- */

export function parsePositiveInt(value, label) {
  const ok =
    (typeof value === "number" || typeof value === "string") &&
    String(value).trim() !== "";

  const num = ok ? Number(value) : NaN;

  if (!Number.isSafeInteger(num) || num <= 0 || num > 2147483647) {
    throw new ServiceError(`${label} tidak valid.`);
  }

  return num;
}

export function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ServiceError(
      "Tanggal wajib diisi dengan format YYYY-MM-DD."
    );
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new ServiceError("Tanggal tidak valid.");
  }

  return value;
}

export function normalizeText(value) {
  if (value === undefined || value === null) return null;

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

export function parseItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ServiceError("Minimal satu produk harus dipilih.");
  }

  const seen = new Set();

  return items.map((item) => {
    const productId = parsePositiveInt(item?.product_id, "Produk");
    const quantity = parsePositiveInt(item?.quantity, "Quantity");

    if (seen.has(productId)) {
      throw new ServiceError(
        "Produk yang sama tidak boleh dipilih dua kali."
      );
    }

    seen.add(productId);

    return { productId, quantity };
  });
}

/* ---------- Helper database ---------- */

export async function loadProducts(client, items, { lock = false } = {}) {
  const ids = items
    .map((item) => item.productId)
    .sort((a, b) => a - b);

  const result = await client.query(
    `SELECT id, name, current_stock
     FROM products
     WHERE id = ANY($1::int[])
     ORDER BY id
     ${lock ? "FOR UPDATE" : ""}`,
    [ids]
  );

  if (result.rowCount !== ids.length) {
    throw new ServiceError("Ada produk yang tidak ditemukan.", 404);
  }

  return new Map(result.rows.map((product) => [product.id, product]));
}
