import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Periksa sesi login
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // 2. Pastikan hanya Admin yang bisa mengakses
    if (session.role !== "admin") {
      return NextResponse.json(
        { message: "Anda tidak memiliki akses." },
        { status: 403 }
      );
    }

    // 3. Ambil data dashboard dari database
    const [
      productStats,
      transactionStats,
      inventoryValue,
      pendingSupplierCount,
      pendingSuppliers,
      inventoryOverview,
      recentTransactions,
      recentActivities,
    ] = await Promise.all([
      // Total produk
      pool.query(`
        SELECT COUNT(*)::int AS total_products
        FROM products
      `),

      // Total transaksi bulan ini
      pool.query(`
        SELECT COUNT(*)::int AS total_transactions
        FROM transactions
        WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
          AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      `),

      // Nilai persediaan berdasarkan harga beli
      pool.query(`
        SELECT COALESCE(
          SUM(purchase_price * current_stock), 0
        ) AS inventory_value
        FROM products
      `),

      // Jumlah seluruh supplier yang menunggu persetujuan
      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM users
        WHERE role = 'supplier'
          AND status = 'pending'
      `),

      // Daftar 5 supplier yang menunggu persetujuan
      pool.query(`
        SELECT
          id,
          name,
          email,
          company_name,
          created_at,
          status
        FROM users
        WHERE role = 'supplier'
          AND status = 'pending'
        ORDER BY created_at DESC
        LIMIT 5
      `),

      // Ringkasan kondisi stok
      pool.query(`
        SELECT
          CASE
            WHEN current_stock = 0 THEN 'out_of_stock'
            WHEN current_stock <= min_stock THEN 'severe'
            WHEN current_stock <= low_stock THEN 'low'
            ELSE 'normal'
          END AS stock_status,
          COUNT(*)::int AS total
        FROM products
        GROUP BY stock_status
      `),

      // 5 transaksi terbaru
      pool.query(`
        SELECT
          t.id,
          t.transaction_number,
          t.type,
          t.transaction_date,
          t.status,
          u.name AS user_name
        FROM transactions t
        LEFT JOIN users u ON t.created_by = u.id
        ORDER BY t.created_at DESC
        LIMIT 5
      `),

      // Aktivitas terbaru yang tercatat di database
      pool.query(`
        SELECT *
        FROM (
          SELECT
            'supplier_registered' AS activity_type,
            'Supplier baru mendaftar' AS title,
            COALESCE(company_name, name) AS description,
            created_at AS activity_date
          FROM users
          WHERE role = 'supplier'

          UNION ALL

          SELECT
            'transaction_created' AS activity_type,
            'Transaksi dibuat' AS title,
            transaction_number AS description,
            created_at AS activity_date
          FROM transactions

          UNION ALL

          SELECT
            'restock_created' AS activity_type,
            'Restock order dibuat' AS title,
            po_number AS description,
            created_at AS activity_date
          FROM restock_orders
        ) AS activities
        ORDER BY activity_date DESC
        LIMIT 8
      `),
    ]);

    // 4. Kirim data dashboard dalam format JSON
    return NextResponse.json({
      stats: {
        totalProducts: productStats.rows[0].total_products,
        totalTransactions: transactionStats.rows[0].total_transactions,
        inventoryValue: inventoryValue.rows[0].inventory_value,
        pendingSuppliers: pendingSupplierCount.rows[0].total,
      },

      pendingSuppliers: pendingSuppliers.rows,

      inventoryOverview: inventoryOverview.rows,

      recentTransactions: recentTransactions.rows,

      recentActivities: recentActivities.rows,
    });
  } catch (error) {
    console.error("Admin Dashboard API Error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data dashboard." },
      { status: 500 }
    );
  }
}
