import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, name, email, password, role, status
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    if (user.status === "pending") {
      return NextResponse.json(
        { message: "Akun Anda masih menunggu persetujuan Admin." },
        { status: 403 }
      );
    }

    if (user.status === "rejected") {
      return NextResponse.json(
        { message: "Pendaftaran akun Anda ditolak oleh Admin." },
        { status: 403 }
      );
    }

    if (user.status !== "approved") {
      return NextResponse.json(
        { message: "Status akun tidak valid." },
        { status: 403 }
      );
    }

    await createSession(user);

    return NextResponse.json({
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}