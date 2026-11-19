import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    // 1. Periksa sesi admin
    const session = await getSession();

    if (!session) {
      return Response.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (session.role !== "admin") {
      return Response.json(
        { message: "Kamu tidak memiliki akses." },
        { status: 403 }
      );
    }

    // 2. Periksa ID supplier
    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return Response.json(
        { message: "ID supplier tidak valid." },
        { status: 400 }
      );
    }

    // 3. Periksa tindakan
    const body = await request.json();
    let newStatus;

    if (body.action === "approve") {
      newStatus = "approved";
    } else if (body.action === "reject") {
      newStatus = "rejected";
    } else {
      return Response.json(
        { message: "Tindakan tidak valid." },
        { status: 400 }
      );
    }

    // 4. Perbarui status supplier di database
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
      return Response.json(
        { message: "Supplier tidak ditemukan atau sudah diproses." },
        { status: 404 }
      );
    }

    return Response.json({
      message:
        newStatus === "approved"
          ? "Supplier berhasil disetujui."
          : "Pendaftaran supplier berhasil ditolak.",
      status: newStatus,
    });
  } catch (error) {
    console.error("Supplier status error:", error);

    return Response.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
