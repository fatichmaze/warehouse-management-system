import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      company_name,
      password,
      confirmPassword,
    } = body;

    // Validasi semua field wajib
    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof phone !== "string" || !phone.trim() ||
      typeof company_name !== "string" || !company_name.trim() ||
      typeof password !== "string" || !password ||
      typeof confirmPassword !== "string" || !confirmPassword
    ) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    // Bersihkan input
    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanCompany = company_name.trim();

    // Validasi panjang karakter
    if (cleanName.length > 150) {
      return NextResponse.json(
        { message: "Nama lengkap maksimal 150 karakter." },
        { status: 400 }
      );
    }

    if (normalizedEmail.length > 150) {
      return NextResponse.json(
        { message: "Email maksimal 150 karakter." },
        { status: 400 }
      );
    }

    if (cleanPhone.length > 30) {
      return NextResponse.json(
        { message: "Nomor telepon maksimal 30 karakter." },
        { status: 400 }
      );
    }

    if (cleanCompany.length > 150) {
      return NextResponse.json(
        { message: "Nama perusahaan maksimal 150 karakter." },
        { status: 400 }
      );
    }

    // Validasi format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { message: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Validasi password
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Konfirmasi password tidak cocok." },
        { status: 400 }
      );
    }

    // Periksa email duplikat
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan Supplier dengan status Pending
    const result = await pool.query(
      `INSERT INTO users
        (name, email, phone, company_name, password, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, company_name, role, status`,
      [
        cleanName,
        normalizedEmail,
        cleanPhone,
        cleanCompany,
        hashedPassword,
        "supplier",
        "pending",
      ]
    );

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil. Akun menunggu persetujuan Admin.",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Supplier Error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
