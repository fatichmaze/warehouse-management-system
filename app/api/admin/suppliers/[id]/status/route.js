
import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireApiRole(["admin"], {
      errorKey: "message",
      messages: {
        unauthenticated: "Silakan login terlebih dahulu.",
        forbidden: "Kamu tidak memiliki akses.",
      },
    });

    if (!auth.ok) return auth.response;

    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { message: "ID supplier tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    let newStatus;

    if (body.action === "approve") {
      newStatus = "approved";
    } else if (body.action === "reject") {
      newStatus = "rejected";
    } else {
      return NextResponse.json(
        { message: "Tindakan tidak valid." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE users
       SET status = $1
       WHERE id = $2
         AND role = 'supplier'
         AND status = 'pending'
       RETURNING id`,
      [newStatus, Number(id)]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Supplier tidak ditemukan atau sudah diproses." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message:
        newStatus === "approved"
          ? "Supplier berhasil disetujui."
          : "Pendaftaran supplier berhasil ditolak.",
      status: newStatus,
    });
  } catch (error) {
    console.error("Supplier status error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
