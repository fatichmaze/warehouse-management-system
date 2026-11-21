import pool from "@/lib/db";

export class ServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
}

async function withTransaction(fn) {
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

function parsePositiveInt(value, label) {
  const ok =
    (typeof value === "number" || typeof value === "string") &&
    String(value).trim() !== "";

  const num = ok ? Number(value) : NaN;

  if (!Number.isSafeInteger(num) || num <= 0 || num > 2147483647) {
    throw new ServiceError(`${label} tidak valid.`);
  }

  return num;
}

function parseDate(value) {
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

function normalizeText(value) {
  if (value === undefined || value === null) return null;

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function parseItems(items) {
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

async function loadProducts(client, items, { lock = false } = {}) {
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

function assertStockAvailable(items, productMap) {
  for (const item of items) {
    const product = productMap.get(item.productId);

    if (item.quantity > product.current_stock) {
      throw new ServiceError(
        `Quantity "${product.name}" (${item.quantity}) melebihi stok tersedia (${product.current_stock}).`
      );
    }
  }
}

async function insertItems(client, transactionId, items) {
  for (const item of items) {
    await client.query(
      `INSERT INTO transaction_items
        (transaction_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [transactionId, item.productId, item.quantity]
    );
  }
}

async function generateTransactionNumber(client, type, date) {
  const prefix = `${type === "incoming" ? "IN" : "OUT"}-${date.replaceAll("-", "")}`;

  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext($1))",
    [prefix]
  );

  const result = await client.query(
    `SELECT COALESCE(
       MAX(SUBSTRING(transaction_number FROM '[0-9]+$')::int),
       0
     ) AS last
     FROM transactions
     WHERE transaction_number LIKE $1`,
    [`${prefix}-%`]
  );

  return `${prefix}-${String(Number(result.rows[0].last) + 1).padStart(4, "0")}`;
}

async function getTransactionForUpdate(client, id) {
  const result = await client.query(
    `SELECT id, type, status, created_by, restock_order_id
     FROM transactions
     WHERE id = $1
     FOR UPDATE`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new ServiceError("Transaksi tidak ditemukan.", 404);
  }

  return result.rows[0];
}

async function getTransactionItems(client, transactionId) {
  const result = await client.query(
    `SELECT product_id, quantity
     FROM transaction_items
     WHERE transaction_id = $1
     ORDER BY product_id`,
    [transactionId]
  );

  return result.rows.map((row) => ({
    productId: row.product_id,
    quantity: row.quantity,
  }));
}

/* ---------- Create: Staff Gudang ---------- */

export async function createTransaction(user, input) {
  if (user.role !== "staff") {
    throw new ServiceError(
      "Hanya Staff Gudang yang dapat membuat transaksi.",
      403
    );
  }

  const type = input?.type;

  if (type !== "incoming" && type !== "outgoing") {
    throw new ServiceError(
      "Tipe transaksi harus incoming atau outgoing."
    );
  }

  const date = parseDate(input.transaction_date);
  const notes = normalizeText(input.notes);

  if (type === "incoming" && !notes) {
  throw new ServiceError(
    "Catatan wajib diisi untuk transaksi barang masuk."
  );
    }

  return withTransaction(async (client) => {
    let supplierId = null;
    let restockOrderId = null;
    let customer = null;
    let items;

    if (type === "incoming") {
      const hasPo =
        input.restock_order_id !== undefined &&
        input.restock_order_id !== null &&
        input.restock_order_id !== "";

      if (hasPo) {
        restockOrderId = parsePositiveInt(
          input.restock_order_id,
          "Nomor PO"
        );

        const po = await client.query(
          `SELECT id, supplier_id, status
           FROM restock_orders
           WHERE id = $1
           FOR UPDATE`,
          [restockOrderId]
        );

        if (po.rowCount === 0) {
          throw new ServiceError("Restock Order tidak ditemukan.", 404);
        }

        if (po.rows[0].status !== "Received") {
          throw new ServiceError(
            "Restock Order harus berstatus Received."
          );
        }

        const used = await client.query(
          `SELECT 1
           FROM transactions
           WHERE restock_order_id = $1
             AND status <> 'Rejected'
           LIMIT 1`,
          [restockOrderId]
        );

        if (used.rowCount > 0) {
          throw new ServiceError(
            "Restock Order ini sudah dipakai oleh transaksi barang masuk lain.",
            409
          );
        }

        supplierId = po.rows[0].supplier_id;

        const poItems = await client.query(
          `SELECT product_id, quantity
           FROM restock_order_items
           WHERE restock_order_id = $1
           ORDER BY product_id`,
          [restockOrderId]
        );

        if (poItems.rowCount === 0) {
          throw new ServiceError(
            "Restock Order tidak memiliki item produk."
          );
        }

        items = poItems.rows.map((row) => ({
          productId: row.product_id,
          quantity: row.quantity,
        }));

        await loadProducts(client, items);
      } else {
        supplierId = parsePositiveInt(input.supplier_id, "Supplier");

        const supplier = await client.query(
          `SELECT id
           FROM users
           WHERE id = $1
             AND role = 'supplier'
             AND status = 'approved'`,
          [supplierId]
        );

        if (supplier.rowCount === 0) {
          throw new ServiceError(
            "Supplier tidak ditemukan atau belum disetujui.",
            404
          );
        }

        items = parseItems(input.items);
        await loadProducts(client, items);
      }
    } else {
      customer = normalizeText(input.customer_destination);

      if (!customer) {
        throw new ServiceError(
          "Nama customer/tujuan wajib diisi."
        );
      }

      items = parseItems(input.items);

      const productMap = await loadProducts(client, items);
      assertStockAvailable(items, productMap);
    }

    const number = await generateTransactionNumber(
      client,
      type,
      date
    );

    const inserted = await client.query(
      `INSERT INTO transactions
        (
          transaction_number,
          type,
          transaction_date,
          restock_order_id,
          supplier_id,
          customer_destination,
          notes,
          created_by
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, transaction_number, type, status`,
      [
        number,
        type,
        date,
        restockOrderId,
        supplierId,
        customer,
        notes,
        user.id,
      ]
    );

    await insertItems(client, inserted.rows[0].id, items);

    return inserted.rows[0];
  });
}

/* ---------- Edit: Pending, Staff pembuat ---------- */

export async function updateTransaction(user, id, input) {
  if (user.role !== "staff") {
    throw new ServiceError(
      "Hanya Staff Gudang yang dapat mengubah transaksi.",
      403
    );
  }

  const notes = normalizeText(input?.notes);

  return withTransaction(async (client) => {
    const trx = await getTransactionForUpdate(client, id);

    if (trx.created_by !== user.id) {
      throw new ServiceError(
        "Anda hanya dapat mengubah transaksi yang Anda buat.",
        403
      );
    }

    if (trx.status !== "Pending") {
      throw new ServiceError(
        "Hanya transaksi Pending yang dapat diedit."
      );
    }

    if (trx.type === "incoming" && !notes) {
        throw new ServiceError(
            "Catatan wajib diisi untuk transaksi barang masuk."
        );
    }

    // Transaksi yang berasal dari PO tidak boleh mengubah item.
    if (trx.restock_order_id !== null) {
      await client.query(
        "UPDATE transactions SET notes = $1 WHERE id = $2",
        [notes, id]
      );

      return { id, status: trx.status };
    }

    const items = parseItems(input?.items);
    const productMap = await loadProducts(client, items);

    if (trx.type === "outgoing") {
      assertStockAvailable(items, productMap);
    }

    await client.query(
      "DELETE FROM transaction_items WHERE transaction_id = $1",
      [id]
    );

    await insertItems(client, id, items);

    await client.query(
      "UPDATE transactions SET notes = $1 WHERE id = $2",
      [notes, id]
    );

    return { id, status: trx.status };
  });
}

/* ---------- Delete: Pending, Staff pembuat ---------- */

export async function deleteTransaction(user, id) {
  if (user.role !== "staff") {
    throw new ServiceError(
      "Hanya Staff Gudang yang dapat menghapus transaksi.",
      403
    );
  }

  return withTransaction(async (client) => {
    const trx = await getTransactionForUpdate(client, id);

    if (trx.created_by !== user.id) {
      throw new ServiceError(
        "Anda hanya dapat menghapus transaksi yang Anda buat.",
        403
      );
    }

    if (trx.status !== "Pending") {
      throw new ServiceError(
        "Hanya transaksi Pending yang dapat dihapus."
      );
    }

    await client.query(
      "DELETE FROM transaction_items WHERE transaction_id = $1",
      [id]
    );

    await client.query(
      "DELETE FROM transactions WHERE id = $1",
      [id]
    );

    return { id };
  });
}

/* ---------- Approve: Warehouse Manager ---------- */

export async function approveTransaction(user, id) {
  if (user.role !== "warehouse_manager") {
    throw new ServiceError(
      "Hanya Warehouse Manager yang dapat menyetujui transaksi.",
      403
    );
  }

  return withTransaction(async (client) => {
    const trx = await getTransactionForUpdate(client, id);

    if (trx.status !== "Pending") {
      throw new ServiceError(
        "Hanya transaksi Pending yang dapat disetujui."
      );
    }

    const items = await getTransactionItems(client, id);

    if (items.length === 0) {
      throw new ServiceError(
        "Transaksi tidak memiliki item produk."
      );
    }

    const productMap = await loadProducts(
      client,
      items,
      { lock: true }
    );

    if (trx.type === "outgoing") {
      assertStockAvailable(items, productMap);
    }

    const sign = trx.type === "incoming" ? 1 : -1;

    for (const item of items) {
      await client.query(
        `UPDATE products
         SET current_stock = current_stock + $1
         WHERE id = $2`,
        [sign * item.quantity, item.productId]
      );
    }

    await client.query(
      `UPDATE transactions
       SET status = 'Approved',
           approved_by = $1
       WHERE id = $2`,
      [user.id, id]
    );

    return { id, status: "Approved" };
  });
}

/* ---------- Reject: Warehouse Manager ---------- */

export async function rejectTransaction(user, id, reason) {
  if (user.role !== "warehouse_manager") {
    throw new ServiceError(
      "Hanya Warehouse Manager yang dapat menolak transaksi.",
      403
    );
  }

  const cleanReason = normalizeText(reason);

  if (!cleanReason) {
    throw new ServiceError(
      "Alasan penolakan wajib diisi."
    );
  }

  return withTransaction(async (client) => {
    const trx = await getTransactionForUpdate(client, id);

    if (trx.status !== "Pending") {
      throw new ServiceError(
        "Hanya transaksi Pending yang dapat ditolak."
      );
    }

    await client.query(
      `UPDATE transactions
       SET status = 'Rejected',
           rejection_reason = $1,
           approved_by = $2
       WHERE id = $3`,
      [cleanReason, user.id, id]
    );

    return { id, status: "Rejected" };
  });
}

/* ---------- Ship: Staff pembuat, barang keluar ---------- */

export async function markTransactionShipped(user, id) {
  if (user.role !== "staff") {
    throw new ServiceError(
      "Hanya Staff Gudang yang dapat menandai Shipped.",
      403
    );
  }

  return withTransaction(async (client) => {
    const trx = await getTransactionForUpdate(client, id);

    if (trx.created_by !== user.id) {
      throw new ServiceError(
        "Anda hanya dapat menandai transaksi yang Anda buat.",
        403
      );
    }

    if (trx.type !== "outgoing") {
      throw new ServiceError(
        "Status Shipped hanya untuk barang keluar."
      );
    }

    if (trx.status !== "Approved") {
      throw new ServiceError(
        "Hanya transaksi Approved yang dapat ditandai Shipped."
      );
    }

    await client.query(
      `UPDATE transactions
       SET status = 'Shipped'
       WHERE id = $1`,
      [id]
    );

    return { id, status: "Shipped" };
  });
}