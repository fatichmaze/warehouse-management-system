import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

const ALLOWED_ROLES = ["admin", "warehouse_manager"];

function isValidHttpOrHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseFiniteNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
}

function parseInteger(value) {
  const num = parseFiniteNumber(value);
  return Number.isInteger(num) ? num : NaN;
}

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const role = String(session.role ?? "").toLowerCase();
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya Admin dan Warehouse Manager yang diizinkan." },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format JSON request tidak valid." },
        { status: 400 }
      );
    }

    const sku = typeof body?.sku === "string" ? body.sku.trim().toUpperCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
    const rackLocation =
      typeof body?.rack_location === "string" ? body.rack_location.trim() : "";

    if (!sku || !name || !unit || !rackLocation) {
      return NextResponse.json(
        {
          error: "Field sku, name, unit, dan rack_location wajib diisi dan tidak boleh kosong.",
        },
        { status: 400 }
      );
    }

    const categoryId = parseInteger(body?.category_id);
    if (Number.isNaN(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { error: "category_id tidak valid." },
        { status: 400 }
      );
    }

    const purchasePrice = parseFiniteNumber(body?.purchase_price);
    const sellingPrice = parseFiniteNumber(body?.selling_price);
    const minStock = parseInteger(body?.min_stock);
    const lowStock = parseInteger(body?.low_stock);
    const currentStock =
      body?.current_stock === undefined ||
      body?.current_stock === null ||
      body?.current_stock === ""
        ? 0
        : parseInteger(body?.current_stock);

    if (Number.isNaN(purchasePrice) || purchasePrice < 0) {
      return NextResponse.json(
        { error: "purchase_price harus berupa angka >= 0." },
        { status: 400 }
      );
    }

    if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
      return NextResponse.json(
        { error: "selling_price harus berupa angka >= 0." },
        { status: 400 }
      );
    }

    if (Number.isNaN(minStock) || minStock < 0) {
      return NextResponse.json(
        { error: "min_stock harus berupa bilangan bulat >= 0." },
        { status: 400 }
      );
    }

    if (Number.isNaN(lowStock)) {
      return NextResponse.json(
        { error: "low_stock harus berupa bilangan bulat yang valid." },
        { status: 400 }
      );
    }

    if (!(lowStock > minStock)) {
      return NextResponse.json(
        { error: "low_stock harus lebih besar dari min_stock." },
        { status: 400 }
      );
    }

    if (Number.isNaN(currentStock) || currentStock < 0) {
      return NextResponse.json(
        { error: "current_stock harus berupa bilangan bulat >= 0." },
        { status: 400 }
      );
    }

    const description = normalizeOptionalText(body?.description);
    const imageUrl = normalizeOptionalText(body?.image_url);

    if (imageUrl !== null && !isValidHttpOrHttpsUrl(imageUrl)) {
      return NextResponse.json(
        {
          error:
            "image_url harus berupa URL valid yang diawali http:// atau https://.",
        },
        { status: 400 }
      );
    }

    const categoryCheck = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (categoryCheck.rowCount === 0) {
      return NextResponse.json(
        { error: "Kategori yang dipilih tidak ditemukan." },
        { status: 404 }
      );
    }

    const skuCheck = await pool.query(
      "SELECT id FROM products WHERE UPPER(TRIM(sku)) = $1",
      [sku]
    );

    if (skuCheck.rowCount > 0) {
      return NextResponse.json(
        { error: "SKU sudah digunakan oleh produk lain." },
        { status: 409 }
      );
    }

    const insertRes = await pool.query(
      `INSERT INTO products (
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
         image_url
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
         created_at`,
      [
        sku,
        name,
        categoryId,
        description,
        purchasePrice,
        sellingPrice,
        minStock,
        lowStock,
        currentStock,
        unit,
        rackLocation,
        imageUrl,
      ]
    );

    const createdProduct = insertRes.rows[0];

    const joinedRes = await pool.query(
      `SELECT
         p.id,
         p.sku,
         p.name,
         p.category_id,
         c.name AS category_name,
         p.description,
         p.purchase_price,
         p.selling_price,
         p.min_stock,
         p.low_stock,
         p.current_stock,
         p.unit,
         p.rack_location,
         p.image_url,
         p.created_at
       FROM products p
       INNER JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [createdProduct.id]
    );

    return NextResponse.json(
      {
        message: "Produk berhasil ditambahkan.",
        data: joinedRes.rows[0] || createdProduct,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "SKU sudah terdaftar (duplikat data)." },
        { status: 409 }
      );
    }

    if (err?.code === "23503") {
      return NextResponse.json(
        { error: "Referensi kategori tidak valid." },
        { status: 400 }
      );
    }

    if (err?.code === "23514") {
      return NextResponse.json(
        { error: "Nilai input melanggar aturan validasi pada database." },
        { status: 400 }
      );
    }

    console.error("POST /api/admin/products error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat menyimpan produk." },
      { status: 500 }
    );
  }
}