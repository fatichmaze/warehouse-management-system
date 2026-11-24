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
    let rejectionReason = null;

    if (body?.action === "approve") {
      newStatus = "approved";
      rejectionReason = null;
    } else if (body?.action === "reject") {
      const rawReason =
        typeof body?.rejection_reason === "string" ? body.rejection_reason : "";
      const trimmedReason = rawReason.trim();

      if (!trimmedReason) {
        return NextResponse.json(
          { message: "Alasan penolakan wajib diisi." },
          { status: 400 }
        );
      }

      newStatus = "rejected";
      rejectionReason = trimmedReason;
    } else {
      return NextResponse.json(
        { message: "Tindakan tidak valid." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE users
       SET status = $1,
           rejection_reason = $2
       WHERE id = $3
         AND role = 'supplier'
         AND status = 'pending'
       RETURNING id`,
      [newStatus, rejectionReason, Number(id)]
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
