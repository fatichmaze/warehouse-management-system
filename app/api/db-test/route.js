import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    return Response.json({
      success: true,
      message: "Koneksi PostgreSQL berhasil!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, message: "Koneksi PostgreSQL gagal." },
      { status: 500 }
    );
  }
}
