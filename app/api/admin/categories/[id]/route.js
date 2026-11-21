import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

const ALLOWED_ROLES = ["admin", "warehouse_manager"];

function parsePositiveIntId(rawId) {
  if (typeof rawId !== "string" && typeof rawId !== "number") {
    return null;
  }

  const trimmed = String(rawId).trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
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

function parseOptionalTextField(value, fieldName) {
  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }
  if (typeof value !== "string") {
    return {
      ok: false,
      error: `Field ${fieldName} harus berupa teks (string) atau null.`,
    };
  }
  const trimmed = value.trim();
  return {
    ok: true,
    value: trimmed === "" ? null : trimmed,
  };
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

    const role = String(session.role ?? "").toLowerCase();
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error:
            "Akses ditolak. Hanya Admin dan Warehouse Manager yang diizinkan.",
        },
        { status: 403 }
      );
    }

    const resolvedParams = await context.params;
    const categoryId = parsePositiveIntId(resolvedParams?.id);
    if (!categoryId) {
      return NextResponse.json(
        { error: "ID kategori tidak valid." },
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

    const existingRes = await pool.query(
      `SELECT id, name, description, image_url, created_at
       FROM categories
       WHERE id = $1`,
      [categoryId]
    );

    if (existingRes.rowCount === 0) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    const currentCategory = existingRes.rows[0];

    const hasNameField = Object.prototype.hasOwnProperty.call(body ?? {}, "name");
    const nextName = hasNameField
      ? typeof body?.name === "string"
        ? body.name.trim()
        : ""
      : String(currentCategory.name ?? "").trim();

    if (!nextName) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi dan tidak boleh hanya spasi." },
        { status: 400 }
      );
    }

    const hasDescriptionField = Object.prototype.hasOwnProperty.call(
      body ?? {},
      "description"
    );
    let nextDescription = null;
    if (hasDescriptionField) {
      const descParsed = parseOptionalTextField(
        body?.description,
        "description"
      );
      if (!descParsed.ok) {
        return NextResponse.json({ error: descParsed.error }, { status: 400 });
      }
      nextDescription = descParsed.value;
    } else {
      const currentDescParsed = parseOptionalTextField(
        currentCategory.description,
        "description"
      );
      nextDescription = currentDescParsed.ok ? currentDescParsed.value : null;
    }

    const hasImageUrlField = Object.prototype.hasOwnProperty.call(
      body ?? {},
      "image_url"
    );
    let nextImageUrl = null;
    if (hasImageUrlField) {
      const imgParsed = parseOptionalTextField(body?.image_url, "image_url");
      if (!imgParsed.ok) {
        return NextResponse.json({ error: imgParsed.error }, { status: 400 });
      }
      nextImageUrl = imgParsed.value;
    } else {
      const currentImgParsed = parseOptionalTextField(
        currentCategory.image_url,
        "image_url"
      );
      nextImageUrl = currentImgParsed.ok ? currentImgParsed.value : null;
    }

    if (nextImageUrl !== null && !isValidHttpOrHttpsUrl(nextImageUrl)) {
      return NextResponse.json(
        {
          error:
            "image_url harus berupa URL valid yang diawali http:// atau https://.",
        },
        { status: 400 }
      );
    }

    const duplicateCheck = await pool.query(
      `SELECT id
       FROM categories
       WHERE LOWER(BTRIM(name)) = LOWER(BTRIM($1)) AND id <> $2`,
      [nextName, categoryId]
    );

    if (duplicateCheck.rowCount > 0) {
      return NextResponse.json(
        { error: "Nama kategori sudah digunakan oleh kategori lain." },
        { status: 409 }
      );
    }

    const updateRes = await pool.query(
      `UPDATE categories
       SET name = $1,
           description = $2,
           image_url = $3
       WHERE id = $4
       RETURNING id, name, description, image_url, created_at`,
      [nextName, nextDescription, nextImageUrl, categoryId]
    );

    if (updateRes.rowCount === 0 || !updateRes.rows?.[0]) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan atau gagal diperbarui." },
        { status: 404 }
      );
    }

    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS product_count FROM products WHERE category_id = $1",
      [categoryId]
    );

    return NextResponse.json(
      {
        message: "Kategori berhasil diperbarui.",
        data: {
          ...updateRes.rows[0],
          product_count: countRes.rows[0]?.product_count ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "Nama kategori sudah terdaftar (duplikat data)." },
        { status: 409 }
      );
    }

    if (err?.code === "23514") {
      return NextResponse.json(
        { error: "Nilai input melanggar aturan validasi pada database." },
        { status: 400 }
      );
    }

    console.error("PATCH /api/admin/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memperbarui kategori." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, context) {
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
        {
          error:
            "Akses ditolak. Hanya Admin dan Warehouse Manager yang diizinkan.",
        },
        { status: 403 }
      );
    }

    const resolvedParams = await context.params;
    const categoryId = parsePositiveIntId(resolvedParams?.id);
    if (!categoryId) {
      return NextResponse.json(
        { error: "ID kategori tidak valid." },
        { status: 400 }
      );
    }

    const existingRes = await pool.query(
      `SELECT id, name, description, image_url, created_at
       FROM categories
       WHERE id = $1`,
      [categoryId]
    );

    if (existingRes.rowCount === 0) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    const linkedProductsRes = await pool.query(
      "SELECT COUNT(*)::int AS total FROM products WHERE category_id = $1",
      [categoryId]
    );
    const linkedProductsCount = linkedProductsRes.rows[0]?.total ?? 0;

    if (linkedProductsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Kategori tidak dapat dihapus karena masih digunakan oleh produk.",
        },
        { status: 409 }
      );
    }

    const deletedRes = await pool.query(
      `DELETE FROM categories
       WHERE id = $1
       RETURNING id, name, description, image_url, created_at`,
      [categoryId]
    );

    if (deletedRes.rowCount === 0 || !deletedRes.rows?.[0]) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan atau sudah dihapus." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Kategori berhasil dihapus.",
        data: deletedRes.rows[0],
      },
      { status: 200 }
    );
  } catch (err) {
    if (err?.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Kategori tidak dapat dihapus karena masih direferensikan oleh data produk.",
        },
        { status: 409 }
      );
    }

    console.error("DELETE /api/admin/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat menghapus kategori." },
      { status: 500 }
    );
  }
}