import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

const ALLOWED_ROLES = new Set(["admin", "warehouse_manager"]);

function parsePositiveIntId(rawId) {
  const str = String(rawId ?? "").trim();
  if (!/^\d+$/.test(str)) {
    return null;
  }
  const parsed = Number.parseInt(str, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function isValidHttpOrHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(request, context) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  const role = String(session.role ?? "").toLowerCase();
  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json(
      {
        error:
          "Forbidden. Hanya admin dan warehouse_manager yang dapat memperbarui produk.",
      },
      { status: 403 }
    );
  }

  const resolvedParams = await context.params;
  const productId = parsePositiveIntId(resolvedParams?.id);
  if (!productId) {
    return NextResponse.json(
      { error: "ID produk tidak valid." },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format JSON pada request body tidak valid." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Request body harus berupa objek JSON." },
      { status: 400 }
    );
  }

  if (Object.prototype.hasOwnProperty.call(body, "sku")) {
    return NextResponse.json(
      { error: "SKU bersifat immutable dan tidak dapat diubah." },
      { status: 400 }
    );
  }

  const allowedKeys = new Set([
    "name",
    "category_id",
    "description",
    "purchase_price",
    "selling_price",
    "min_stock",
    "low_stock",
    "current_stock",
    "unit",
    "rack_location",
    "image_url",
  ]);

  const incomingKeys = Object.keys(body);
  const unknownKeys = incomingKeys.filter((key) => !allowedKeys.has(key));
  if (unknownKeys.length > 0) {
    return NextResponse.json(
      { error: `Field tidak dikenali: ${unknownKeys.join(", ")}.` },
      { status: 400 }
    );
  }

  if (incomingKeys.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada field yang dikirim untuk diperbarui." },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    const existingResult = await client.query(
      `SELECT
         id,
         sku,
         name,
         category_id,
         description,
         purchase_price,
         selling_price,
         min_stock,
         low_stock,
         current_stock,
         unit,
         rack_location,
         image_url,
         created_at
       FROM products
       WHERE id = $1`,
      [productId]
    );

    if (existingResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    const current = existingResult.rows[0];

    const nextName = Object.prototype.hasOwnProperty.call(body, "name")
      ? typeof body.name === "string"
        ? body.name.trim()
        : ""
      : String(current.name ?? "").trim();

    if (!nextName) {
      return NextResponse.json(
        { error: "Product Name wajib diisi." },
        { status: 400 }
      );
    }

    let nextCategoryId;
    if (Object.prototype.hasOwnProperty.call(body, "category_id")) {
      const catNum = Number(body.category_id);
      if (!Number.isInteger(catNum) || catNum <= 0) {
        return NextResponse.json(
          { error: "Category tidak valid." },
          { status: 400 }
        );
      }
      nextCategoryId = catNum;
    } else {
      nextCategoryId = Number(current.category_id);
    }

    const categoryResult = await client.query(
      "SELECT id FROM categories WHERE id = $1",
      [nextCategoryId]
    );
    if (categoryResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Kategori yang dipilih tidak ditemukan." },
        { status: 400 }
      );
    }

    let nextDescription;
    if (Object.prototype.hasOwnProperty.call(body, "description")) {
      if (body.description === null) {
        nextDescription = null;
      } else if (typeof body.description === "string") {
        const trimmed = body.description.trim();
        nextDescription = trimmed === "" ? null : trimmed;
      } else {
        return NextResponse.json(
          { error: "Description harus berupa teks atau null." },
          { status: 400 }
        );
      }
    } else {
      nextDescription = current.description;
    }

    let nextPurchasePrice;
    if (Object.prototype.hasOwnProperty.call(body, "purchase_price")) {
      const val = Number(body.purchase_price);
      if (
        body.purchase_price === "" ||
        body.purchase_price === null ||
        typeof body.purchase_price === "boolean" ||
        !Number.isFinite(val) ||
        val < 0
      ) {
        return NextResponse.json(
          { error: "Purchase Price harus berupa angka 0 atau lebih." },
          { status: 400 }
        );
      }
      nextPurchasePrice = val;
    } else {
      nextPurchasePrice = Number(current.purchase_price);
    }

    let nextSellingPrice;
    if (Object.prototype.hasOwnProperty.call(body, "selling_price")) {
      const val = Number(body.selling_price);
      if (
        body.selling_price === "" ||
        body.selling_price === null ||
        typeof body.selling_price === "boolean" ||
        !Number.isFinite(val) ||
        val < 0
      ) {
        return NextResponse.json(
          { error: "Selling Price harus berupa angka 0 atau lebih." },
          { status: 400 }
        );
      }
      nextSellingPrice = val;
    } else {
      nextSellingPrice = Number(current.selling_price);
    }

    let nextMinStock;
    if (Object.prototype.hasOwnProperty.call(body, "min_stock")) {
      const val = Number(body.min_stock);
      if (
        body.min_stock === "" ||
        body.min_stock === null ||
        typeof body.min_stock === "boolean" ||
        !Number.isInteger(val) ||
        val < 0
      ) {
        return NextResponse.json(
          { error: "Minimum Stock harus berupa bilangan bulat 0 atau lebih." },
          { status: 400 }
        );
      }
      nextMinStock = val;
    } else {
      nextMinStock = Number(current.min_stock);
    }

    let nextLowStock;
    if (Object.prototype.hasOwnProperty.call(body, "low_stock")) {
      const val = Number(body.low_stock);
      if (
        body.low_stock === "" ||
        body.low_stock === null ||
        typeof body.low_stock === "boolean" ||
        !Number.isInteger(val)
      ) {
        return NextResponse.json(
          {
            error: "Low Stock Threshold harus berupa bilangan bulat yang valid.",
          },
          { status: 400 }
        );
      }
      nextLowStock = val;
    } else {
      nextLowStock = Number(current.low_stock);
    }

    if (!(nextLowStock > nextMinStock)) {
      return NextResponse.json(
        {
          error: "Low Stock Threshold harus lebih besar dari Minimum Stock.",
        },
        { status: 400 }
      );
    }

    let nextCurrentStock;
    if (Object.prototype.hasOwnProperty.call(body, "current_stock")) {
      const val = Number(body.current_stock);
      if (
        body.current_stock === "" ||
        body.current_stock === null ||
        typeof body.current_stock === "boolean" ||
        !Number.isInteger(val) ||
        val < 0
      ) {
        return NextResponse.json(
          { error: "Current Stock harus berupa bilangan bulat 0 atau lebih." },
          { status: 400 }
        );
      }
      nextCurrentStock = val;
    } else {
      nextCurrentStock = Number(current.current_stock);
    }

    const nextUnit = Object.prototype.hasOwnProperty.call(body, "unit")
      ? typeof body.unit === "string"
        ? body.unit.trim()
        : ""
      : String(current.unit ?? "").trim();

    if (!nextUnit) {
      return NextResponse.json(
        { error: "Unit wajib diisi." },
        { status: 400 }
      );
    }

    const nextRackLocation = Object.prototype.hasOwnProperty.call(
      body,
      "rack_location"
    )
      ? typeof body.rack_location === "string"
        ? body.rack_location.trim()
        : ""
      : String(current.rack_location ?? "").trim();

    if (!nextRackLocation) {
      return NextResponse.json(
        { error: "Rack Location wajib diisi." },
        { status: 400 }
      );
    }

    let nextImageUrl;
    if (Object.prototype.hasOwnProperty.call(body, "image_url")) {
      if (body.image_url === null) {
        nextImageUrl = null;
      } else if (typeof body.image_url === "string") {
        const trimmed = body.image_url.trim();
        if (trimmed === "") {
          nextImageUrl = null;
        } else if (!isValidHttpOrHttpsUrl(trimmed)) {
          return NextResponse.json(
            {
              error:
                "Image URL harus berupa URL valid yang diawali http:// atau https://.",
            },
            { status: 400 }
          );
        } else {
          nextImageUrl = trimmed;
        }
      } else {
        return NextResponse.json(
          { error: "Image URL harus berupa string atau null." },
          { status: 400 }
        );
      }
    } else {
      nextImageUrl = current.image_url;
    }

    const updateResult = await client.query(
      `WITH updated AS (
         UPDATE products
         SET
           name = $1,
           category_id = $2,
           description = $3,
           purchase_price = $4,
           selling_price = $5,
           min_stock = $6,
           low_stock = $7,
           current_stock = $8,
           unit = $9,
           rack_location = $10,
           image_url = $11
         WHERE id = $12
         RETURNING
           id,
           sku,
           name,
           category_id,
           description,
           purchase_price,
           selling_price,
           min_stock,
           low_stock,
           current_stock,
           unit,
           rack_location,
           image_url,
           created_at
       )
       SELECT
         u.*,
         c.name AS category_name
       FROM updated u
       LEFT JOIN categories c ON c.id = u.category_id`,
      [
        nextName,
        nextCategoryId,
        nextDescription,
        nextPurchasePrice,
        nextSellingPrice,
        nextMinStock,
        nextLowStock,
        nextCurrentStock,
        nextUnit,
        nextRackLocation,
        nextImageUrl,
        productId,
      ]
    );

    const updatedProduct = updateResult.rows[0];

    return NextResponse.json(
      {
        message: "Produk berhasil diperbarui.",
        data: updatedProduct,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err?.code === "22P02") {
      return NextResponse.json(
        { error: "Format data tidak valid." },
        { status: 400 }
      );
    }

    console.error("PATCH /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memperbarui produk." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(_request, context) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  const role = String(session.role ?? "").toLowerCase();
  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json(
      {
        error:
          "Forbidden. Hanya admin dan warehouse_manager yang dapat menghapus produk.",
      },
      { status: 403 }
    );
  }

  const resolvedParams = await context.params;
  const productId = parsePositiveIntId(resolvedParams?.id);
  if (!productId) {
    return NextResponse.json(
      { error: "ID produk tidak valid." },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  let inTransaction = false;

  try {
    await client.query("BEGIN");
    inTransaction = true;

    const existingResult = await client.query(
      "SELECT id, sku, name FROM products WHERE id = $1",
      [productId]
    );

    if (existingResult.rowCount === 0) {
      await client.query("ROLLBACK");
      inTransaction = false;
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    const historyCheckResult = await client.query(
      `SELECT
         EXISTS (
           SELECT 1 FROM transaction_items WHERE product_id = $1
         ) AS has_transaction_history,
         EXISTS (
           SELECT 1 FROM restock_order_items WHERE product_id = $1
         ) AS has_restock_history`,
      [productId]
    );

    const historyRow = historyCheckResult.rows[0] ?? {};
    if (
      Boolean(historyRow.has_transaction_history) ||
      Boolean(historyRow.has_restock_history)
    ) {
      await client.query("ROLLBACK");
      inTransaction = false;
      return NextResponse.json(
        {
          error:
            "Produk tidak dapat dihapus karena sudah tercatat dalam riwayat transaksi atau restock.",
        },
        { status: 409 }
      );
    }

    const deleteResult = await client.query(
      "DELETE FROM products WHERE id = $1 RETURNING id, sku, name",
      [productId]
    );

    if (deleteResult.rowCount === 0) {
      await client.query("ROLLBACK");
      inTransaction = false;
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    await client.query("COMMIT");
    inTransaction = false;

    return NextResponse.json(
      {
        message: "Produk berhasil dihapus.",
        data: deleteResult.rows[0],
      },
      { status: 200 }
    );
  } catch (err) {
    if (inTransaction) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Abaikan error rollback lanjutan agar error asli tetap terkirim
      }
    }

    if (err?.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Produk tidak dapat dihapus karena sudah tercatat dalam riwayat transaksi atau restock.",
        },
        { status: 409 }
      );
    }

    if (err?.code === "22P02") {
      return NextResponse.json(
        { error: "Format ID produk tidak valid." },
        { status: 400 }
      );
    }

    console.error("DELETE /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat menghapus produk." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}