import pool from "@/lib/db";
import {
  ServiceError,
  withTransaction,
  parsePositiveInt,
  parseDate,
  normalizeText,
  parseItems,
  loadProducts,
} from "@/lib/service-core";

const PO_STATUSES = [
  "Pending",
  "Confirmed",
  "Rejected",
  "In Transit",
  "Received",
];

/* ---------- Helper nomor PO ---------- */

async function generatePONumber(client, date) {
  const prefix = `PO-${date.replaceAll("-", "")}`;

  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext($1))",
    [prefix]
  );

  const result = await client.query(
    `SELECT COALESCE(
       MAX(SUBSTRING(po_number FROM '[0-9]+$')::int),
       0
     ) AS last
     FROM restock_orders
     WHERE po_number LIKE $1`,
    [`${prefix}-%`]
  );

  const nextNumber = Number(result.rows[0].last) + 1;

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

/* ---------- List Restock Orders ---------- */

export async function getRestockOrders(user, filters = {}) {
  if (!["warehouse_manager", "supplier"].includes(user.role)) {
    throw new ServiceError(
      "Anda tidak memiliki akses ke Restock Order.",
      403
    );
  }

  const conditions = [];
  const params = [];

  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  // Supplier hanya dapat melihat PO miliknya sendiri.
  if (user.role === "supplier") {
    conditions.push(`ro.supplier_id = ${add(user.id)}`);
  }

  const status = normalizeText(filters.status);

  if (status && PO_STATUSES.includes(status)) {
    conditions.push(`ro.status = ${add(status)}`);
  }

  const search = normalizeText(filters.search);

  if (search) {
    conditions.push(
      `(ro.po_number ILIKE ${add(`%${search}%`)}
        OR s.name ILIKE ${add(`%${search}%`)}
        OR s.company_name ILIKE ${add(`%${search}%`)})`
    );
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const page = Math.max(
    1,
    Number.parseInt(filters.page ?? "1", 10) || 1
  );

  const pageSize = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(filters.pageSize ?? "10", 10) || 10
    )
  );

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM restock_orders ro
     JOIN users s ON s.id = ro.supplier_id
     ${where}`,
    params
  );

  const total = countResult.rows[0].total;

  const limitP = add(pageSize);
  const offsetP = add((page - 1) * pageSize);

  const result = await pool.query(
    `SELECT
       ro.id,
       ro.po_number,
       ro.supplier_id,
       COALESCE(s.company_name, s.name) AS supplier_name,
       ro.order_date::text AS order_date,
        ro.expected_delivery_date::text AS expected_delivery_date,
       ro.status,
       ro.status_notes,
       ro.created_at,
       ro.confirmed_at,
       ro.rejected_at,
       ro.in_transit_at,
       ro.received_at,
       (SELECT COUNT(*)::int
        FROM restock_order_items roi
        WHERE roi.restock_order_id = ro.id) AS item_count,
       (SELECT COALESCE(SUM(roi.quantity), 0)::int
        FROM restock_order_items roi
        WHERE roi.restock_order_id = ro.id) AS total_quantity
     FROM restock_orders ro
     JOIN users s ON s.id = ro.supplier_id
     ${where}
     ORDER BY ro.created_at DESC, ro.id DESC
     LIMIT ${limitP} OFFSET ${offsetP}`,
    params
  );

  return {
    data: result.rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

/* ---------- Create Restock Order: Manager ---------- */

export async function createRestockOrder(user, input) {
  if (user.role !== "warehouse_manager") {
    throw new ServiceError(
      "Hanya Warehouse Manager yang dapat membuat Restock Order.",
      403
    );
  }

  const supplierId = parsePositiveInt(
    input?.supplier_id,
    "Supplier"
  );

  const orderDate = parseDate(input?.order_date);

  const expectedDate = parseDate(
    input?.expected_delivery_date
  );

  if (expectedDate < orderDate) {
    throw new ServiceError(
      "Tanggal pengiriman tidak boleh lebih awal dari tanggal order."
    );
  }

  const notes = normalizeText(input?.notes);

  if (!notes) {
    throw new ServiceError(
      "Catatan Restock Order wajib diisi."
    );
  }

  const items = parseItems(input?.items);

  return withTransaction(async (client) => {
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

    // Pastikan seluruh produk benar-benar tersedia.
    await loadProducts(client, items);

    const poNumber = await generatePONumber(
      client,
      orderDate
    );

    const inserted = await client.query(
      `INSERT INTO restock_orders (
         po_number,
         supplier_id,
         created_by,
         order_date,
         expected_delivery_date,
         notes,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
       RETURNING
         id,
         po_number,
         supplier_id,
         order_date::text AS order_date,
         expected_delivery_date::text AS expected_delivery_date,
         notes,
         status,
         created_at`,
      [
        poNumber,
        supplierId,
        user.id,
        orderDate,
        expectedDate,
        notes,
      ]
    );

    const restockOrder = inserted.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO restock_order_items (
           restock_order_id,
           product_id,
           quantity
         )
         VALUES ($1, $2, $3)`,
        [
          restockOrder.id,
          item.productId,
          item.quantity,
        ]
      );
    }

    return restockOrder;
  });
}

/* ---------- Get Restock Order Detail ---------- */

export async function getRestockOrder(user, id) {
  if (!["warehouse_manager", "supplier"].includes(user.role)) {
    throw new ServiceError(
      "Anda tidak memiliki akses ke Restock Order.",
      403
    );
  }

  const params = [id];

  let ownershipCondition = "";

  if (user.role === "supplier") {
    params.push(user.id);
    ownershipCondition = "AND ro.supplier_id = $2";
  }

  const result = await pool.query(
    `SELECT
       ro.id,
       ro.po_number,
       ro.supplier_id,
       COALESCE(s.company_name, s.name) AS supplier_name,
       s.email AS supplier_email,
       ro.created_by,
       creator.name AS created_by_name,
       ro.order_date::text AS order_date,
       ro.expected_delivery_date::text AS expected_delivery_date,
       ro.notes,
       ro.status,
       ro.status_notes,
       ro.created_at,
       ro.confirmed_at,
       ro.rejected_at,
       ro.in_transit_at,
       ro.received_at
     FROM restock_orders ro
     JOIN users s ON s.id = ro.supplier_id
     JOIN users creator ON creator.id = ro.created_by
     WHERE ro.id = $1
       ${ownershipCondition}`,
    params
  );

  if (result.rowCount === 0) {
    throw new ServiceError(
      "Restock Order tidak ditemukan.",
      404
    );
  }

  const order = result.rows[0];

  const items = await pool.query(
    `SELECT
       roi.id,
       roi.product_id,
       p.sku,
       p.name AS product_name,
       p.unit,
       roi.quantity
     FROM restock_order_items roi
     JOIN products p ON p.id = roi.product_id
     WHERE roi.restock_order_id = $1
     ORDER BY roi.id`,
    [id]
  );

  return {
    ...order,
    items: items.rows,
  };
}

/* ---------- Update Restock Order Status ---------- */

export async function updateRestockOrderStatus(
  user,
  id,
  action,
  reason
) {
  const supplierActions = ["confirm", "reject", "in_transit"];
  const managerActions = ["received"];

  if (
    user.role === "supplier" &&
    !supplierActions.includes(action)
  ) {
    throw new ServiceError(
      "Supplier hanya dapat mengonfirmasi, menolak, atau menandai In Transit pada Restock Order.",
      403
    );
  }

  if (
    user.role === "warehouse_manager" &&
    !managerActions.includes(action)
  ) {
    throw new ServiceError(
      "Warehouse Manager hanya dapat menandai Restock Order sebagai Received.",
      403
    );
  }

  if (!["supplier", "warehouse_manager"].includes(user.role)) {
    throw new ServiceError(
      "Anda tidak memiliki akses untuk mengubah Restock Order.",
      403
    );
  }

  const cleanReason = normalizeText(reason);

  if (action === "reject" && !cleanReason) {
    throw new ServiceError(
      "Alasan penolakan wajib diisi."
    );
  }

  return withTransaction(async (client) => {
    const result = await client.query(
      `SELECT id, supplier_id, status
       FROM restock_orders
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (result.rowCount === 0) {
      throw new ServiceError(
        "Restock Order tidak ditemukan.",
        404
      );
    }

    const order = result.rows[0];

    // Supplier hanya boleh mengubah PO miliknya.
    if (
      user.role === "supplier" &&
      order.supplier_id !== user.id
    ) {
      throw new ServiceError(
        "Anda tidak memiliki akses ke Restock Order ini.",
        403
      );
    }

    let nextStatus;
    let timestampColumn;
    let statusNotes = null;

    if (action === "confirm") {
      if (order.status !== "Pending") {
        throw new ServiceError(
          "Hanya Restock Order Pending yang dapat dikonfirmasi."
        );
      }

      nextStatus = "Confirmed";
      timestampColumn = "confirmed_at";
    } else if (action === "reject") {
      if (order.status !== "Pending") {
        throw new ServiceError(
          "Hanya Restock Order Pending yang dapat ditolak."
        );
      }

      nextStatus = "Rejected";
      timestampColumn = "rejected_at";
      statusNotes = cleanReason;
    } else if (action === "in_transit") {
      if (order.status !== "Confirmed") {
        throw new ServiceError(
          "Hanya Restock Order Confirmed yang dapat diubah menjadi In Transit."
        );
      }

      nextStatus = "In Transit";
      timestampColumn = "in_transit_at";
    } else if (action === "received") {
      if (order.status !== "In Transit") {
        throw new ServiceError(
          "Hanya Restock Order In Transit yang dapat diubah menjadi Received."
        );
      }

      nextStatus = "Received";
      timestampColumn = "received_at";
    } else {
      throw new ServiceError(
        "Aksi perubahan status tidak valid."
      );
    }

    // Nama kolom timestamp berasal dari daftar aksi tetap di atas.
    const updated = await client.query(
      `UPDATE restock_orders
       SET status = $1,
           status_notes = $2,
           ${timestampColumn} = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, po_number, status, status_notes,
                 confirmed_at, rejected_at,
                 in_transit_at, received_at`,
      [nextStatus, statusNotes, id]
    );

    // Perubahan status PO tidak pernah mengubah stok.
    return updated.rows[0];
  });
}