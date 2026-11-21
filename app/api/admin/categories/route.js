import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
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

export async function GET() {
  try {
    const auth = await requireApiRole(ALLOWED_ROLES, {
      errorKey: "error",
      messages: {
        unauthenticated: "Sesi tidak ditemukan. Silakan login terlebih dahulu.",
        forbidden:
          "Akses ditolak. Hanya Admin dan Warehouse Manager yang diizinkan.",
      },
    });

    if (!auth.ok) return auth.response;

    const result = await pool.query(
      `SELECT
         c.id,
         c.name,
         c.description,
         c.image_url,
         c.created_at,
         COUNT(p.id)::int AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id, c.name, c.description, c.image_url, c.created_at
       ORDER BY c.name ASC, c.id ASC`
    );

    return NextResponse.json(
      {
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat mengambil data kategori." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireApiRole(ALLOWED_ROLES, {
      errorKey: "error",
      messages: {
        unauthenticated: "Sesi tidak ditemukan. Silakan login terlebih dahulu.",
        forbidden:
          "Akses ditolak. Hanya Admin dan Warehouse Manager yang diizinkan.",
      },
    });

    if (!auth.ok) return auth.response;

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

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi dan tidak boleh hanya spasi." },
        { status: 400 }
      );
    }

    const descriptionResult = parseOptionalTextField(
      body?.description,
      "description"
    );

    if (!descriptionResult.ok) {
      return NextResponse.json(
        { error: descriptionResult.error },
        { status: 400 }
      );
    }

    const imageUrlResult = parseOptionalTextField(
      body?.image_url,
      "image_url"
    );

    if (!imageUrlResult.ok) {
      return NextResponse.json(
        { error: imageUrlResult.error },
        { status: 400 }
      );
    }

    const description = descriptionResult.value;
    const imageUrl = imageUrlResult.value;

    if (imageUrl !== null && !isValidHttpOrHttpsUrl(imageUrl)) {
      return NextResponse.json(
        {
          error:
            "image_url harus berupa URL valid yang diawali http:// atau https://.",
        },
        { status: 400 }
      );
    }

    const duplicateCheck = await pool.query(
      "SELECT id FROM categories WHERE LOWER(BTRIM(name)) = LOWER(BTRIM($1))",
      [name]
    );

    if (duplicateCheck.rowCount > 0) {
      return NextResponse.json(
        { error: "Nama kategori sudah digunakan." },
        { status: 409 }
      );
    }

    const insertRes = await pool.query(
      `INSERT INTO categories (name, description, image_url)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, image_url, created_at`,
      [name, description, imageUrl]
    );

    const createdCategory = insertRes.rows[0];

    return NextResponse.json(
      {
        message: "Kategori berhasil ditambahkan.",
        data: {
          ...createdCategory,
          product_count: 0,
        },
      },
      { status: 201 }
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

    console.error("POST /api/admin/categories error:", err);

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat menyimpan kategori." },
      { status: 500 }
    );
  }
}
