import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

const ALLOWED_ROLES = ["admin", "warehouse_manager"];

function parsePositiveInteger(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : NaN;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
  }
  return NaN;
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

function isValidHttpOrHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(request, context) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (!ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json(
        {
          error:
            "Akses ditolak. Hanya Admin dan Warehouse Manager yang diizinkan.",
        },
        { status: 403 }
      );
    }

    const resolvedParams = await context.params;
    const productId = parsePositiveInteger(resolvedParams?.id);

    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { error: "Parameter id produk tidak valid." },
        { status: 400 }
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

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
    const rackLocation =
      typeof body?.rack_location === "string" ? body.rack_location.trim() : "";

    if (!name || !unit || !rackLocation) {
      return NextResponse.json(
        {
          error:
            "Field name, unit, dan rack_location wajib diisi dan tidak boleh kosong.",
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
    const currentStock = parseInteger(body?.current_stock);

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
    const rawImageUrl = normalizeOptionalText(body?.image_url);

    if (rawImageUrl !== null && !isValidHttpOrHttpsUrl(rawImageUrl)) {
      return NextResponse.json(
        {
          error:
            "image_url harus berupa URL valid dengan protokol http atau https.",
        },
        { status: 400 }
      );
    }

    const imageUrl = rawImageUrl;

    const existingProductRes = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [productId]
    );

    if (existingProductRes.rowCount === 0) {
      return NextResponse.json(
        { error: "Produk yang ingin diperbarui tidak ditemukan." },
        { status: 404 }
      );
    }

    const categoryCheckRes = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (categoryCheckRes.rowCount === 0) {
      return NextResponse.json(
        { error: "Kategori yang dipilih tidak ditemukan." },
        { status: 404 }
      );
    }

    await pool.query(
      `UPDATE products
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
       WHERE id = $12`,
      [
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
        productId,
      ]
    );

    const updatedProductRes = await pool.query(
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
      [productId]
    );

    return NextResponse.json(
      {
        message: "Produk berhasil diperbarui.",
        data: updatedProductRes.rows[0],
      },
      { status: 200 }
    );
  } catch (err) {
    if (err?.code === "22P02") {
      return NextResponse.json(
        { error: "Format parameter atau nilai input tidak valid." },
        { status: 400 }
      );
    }

    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "Terjadi konflik data unik pada produk." },
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

    console.error("PATCH /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memperbarui produk." },
      { status: 500 }
    );
  }
}