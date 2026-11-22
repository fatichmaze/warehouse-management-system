import { requirePageRole } from "@/lib/page-auth";
import pool from "@/lib/db";
import ManagerDashboardClient from "@/components/dashboard/warehouse-manager/ManagerDashboardClient";

async function getManagerDashboardData() {
  const [
    productResult,
    stockResult,
    pendingTransactionResult,
    restockResult,
    recentTransactionResult,
  ] = await Promise.all([
    pool.query(`
      SELECT COUNT(*)::int AS total_products
      FROM products
    `),

    pool.query(`
      SELECT
        COALESCE(SUM(current_stock), 0)::int AS total_stock,
        COUNT(*) FILTER (
          WHERE current_stock = 0
        )::int AS out_of_stock,
        COUNT(*) FILTER (
          WHERE current_stock > 0 AND current_stock <= min_stock
        )::int AS severe,
        COUNT(*) FILTER (
          WHERE current_stock > min_stock AND current_stock <= low_stock
        )::int AS low
      FROM products
    `),

    // Transaksi yang menunggu persetujuan Manager
    pool.query(`
      SELECT
        t.id,
        t.transaction_number,
        t.type,
        t.transaction_date,
        t.status,
        u.name AS creator_name,
        COUNT(ti.id)::int AS total_items,
        COALESCE(SUM(ti.quantity), 0)::int AS total_quantity
      FROM transactions t
      LEFT JOIN users u ON u.id = t.created_by
      LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
      WHERE t.status = 'Pending'
      GROUP BY t.id, u.name
      ORDER BY t.created_at DESC, t.id DESC
      LIMIT 5
    `),

    // Restock yang sedang berjalan
    pool.query(`
      SELECT
        ro.id,
        ro.po_number,
        ro.status,
        ro.order_date,
        ro.expected_delivery_date,
        u.name AS supplier_name,
        u.company_name
      FROM restock_orders ro
      LEFT JOIN users u ON u.id = ro.supplier_id
      WHERE ro.status IN ('Pending', 'Confirmed', 'In Transit')
      ORDER BY ro.created_at DESC, ro.id DESC
      LIMIT 5
    `),

    // Riwayat transaksi terbaru
    pool.query(`
      SELECT
        t.id,
        t.transaction_number,
        t.type,
        t.transaction_date,
        t.status,
        u.name AS creator_name,
        COUNT(ti.id)::int AS total_items,
        COALESCE(SUM(ti.quantity), 0)::int AS total_quantity
      FROM transactions t
      LEFT JOIN users u ON u.id = t.created_by
      LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
      GROUP BY t.id, u.name
      ORDER BY t.created_at DESC, t.id DESC
      LIMIT 6
    `),
  ]);

  const stock = stockResult.rows[0];

  return {
    totalProducts: productResult.rows[0].total_products,
    totalStock: stock.total_stock,

    stockOverview: {
      outOfStock: stock.out_of_stock,
      severe: stock.severe,
      low: stock.low,
    },

    pendingTransactions: pendingTransactionResult.rows.length,
    pendingTransactionList: pendingTransactionResult.rows,

    ongoingRestockOrders: restockResult.rows.length,
    ongoingRestockList: restockResult.rows,

    recentTransactions: recentTransactionResult.rows,
  };
}

export default async function WarehouseManagerDashboardPage() {
  const user = await requirePageRole(["warehouse_manager"]);
  const dashboardData = await getManagerDashboardData();

  return (
    <ManagerDashboardClient
      managerName={user.name}
      userRole={user.role}
      dashboardData={dashboardData}
    />
  );
}
