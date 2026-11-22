import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";
import AdminDashboardClient from "@/components/dashboard/admin/AdminDashboardClient";

async function getAdminDashboardData() {
  const totalProductsRes = await pool.query(
    `SELECT COUNT(*)::int AS total_products FROM products`
  );

  const transactionsMonthRes = await pool.query(
    `SELECT COUNT(*)::int AS transactions_this_month
     FROM transactions
     WHERE DATE_TRUNC('month', transaction_date::timestamp) = DATE_TRUNC('month', CURRENT_DATE::timestamp)`
  );

  const inventoryValueRes = await pool.query(
    `SELECT COALESCE(SUM(COALESCE(purchase_price, 0) * COALESCE(current_stock, 0)), 0)::numeric AS inventory_value
     FROM products`
  );

  const pendingSuppliersRes = await pool.query(
    `SELECT id, name, email, company_name, status, created_at
     FROM users
     WHERE role = 'supplier' AND status = 'pending'
     ORDER BY created_at DESC`
  );

  const stockOverviewRes = await pool.query(
    `WITH classified AS (
       SELECT
         CASE
           WHEN COALESCE(current_stock, 0) = 0 THEN 'Out of Stock'
           WHEN COALESCE(current_stock, 0) <= COALESCE(min_stock, 0) THEN 'Severe'
           WHEN COALESCE(current_stock, 0) <= COALESCE(low_stock, 0) THEN 'Low'
           ELSE 'Normal'
         END AS stock_category
       FROM products
     )
     SELECT
       COUNT(*)::int AS total_products,
       COUNT(*) FILTER (WHERE stock_category = 'Normal')::int AS normal_count,
       COUNT(*) FILTER (WHERE stock_category = 'Low')::int AS low_count,
       COUNT(*) FILTER (WHERE stock_category = 'Severe')::int AS severe_count,
       COUNT(*) FILTER (WHERE stock_category = 'Out of Stock')::int AS out_of_stock_count
     FROM classified`
  );

  const stockAlertsRes = await pool.query(
    `SELECT *
     FROM (
       SELECT
         id,
         name,
         sku,
         current_stock,
         min_stock,
         low_stock,
         CASE
           WHEN COALESCE(current_stock, 0) = 0 THEN 'Out of Stock'
           WHEN COALESCE(current_stock, 0) <= COALESCE(min_stock, 0) THEN 'Severe'
           WHEN COALESCE(current_stock, 0) <= COALESCE(low_stock, 0) THEN 'Low'
           ELSE 'Normal'
         END AS stock_status
       FROM products
     ) p
     WHERE p.stock_status IN ('Out of Stock', 'Severe', 'Low')
     ORDER BY
       CASE p.stock_status
         WHEN 'Out of Stock' THEN 1
         WHEN 'Severe' THEN 2
         WHEN 'Low' THEN 3
         ELSE 4
       END,
       COALESCE(p.current_stock, 0) ASC,
       p.id ASC`
  );

  const recentTransactionsRes = await pool.query(
    `SELECT
       t.id,
       t.transaction_number,
       t.type,
       t.transaction_date,
       t.status,
       t.created_at,
       u.name AS user_name
     FROM transactions t
     LEFT JOIN users u ON t.created_by = u.id
     ORDER BY COALESCE(t.created_at, t.transaction_date::timestamptz) DESC, t.id DESC
     LIMIT 5`
  );

  const recentActivitiesRes = await pool.query(
    `SELECT *
     FROM (
       SELECT
         CONCAT('trx-', t.id) AS id,
         'transaction' AS kind,
         t.type AS trx_type,
         CONCAT(
           COALESCE(u.name, 'Pengguna'),
           ' mencatat ',
           CASE
             WHEN LOWER(TRIM(COALESCE(t.type, ''))) = 'outgoing' THEN 'Stock Out'
             WHEN LOWER(TRIM(COALESCE(t.type, ''))) = 'incoming' THEN 'Stock In'
             ELSE COALESCE(t.type, 'transaksi')
           END
         ) AS title,
         CONCAT(
           COALESCE(t.transaction_number, '-'),
           ' • Status: ',
           COALESCE(t.status, '-')
         ) AS subtitle,
         COALESCE(t.created_at, t.transaction_date::timestamptz) AS occurred_at
       FROM transactions t
       LEFT JOIN users u ON t.created_by = u.id

       UNION ALL

       SELECT
         CONCAT('supplier-', u.id) AS id,
         'supplier' AS kind,
         NULL AS trx_type,
         CONCAT('Pendaftaran supplier: ', COALESCE(u.name, '-')) AS title,
         CONCAT(
           COALESCE(u.company_name, u.email, '-'),
           ' • Status: ',
           COALESCE(u.status, '-')
         ) AS subtitle,
         u.created_at AS occurred_at
       FROM users u
       WHERE u.role = 'supplier'
     ) act
     WHERE act.occurred_at IS NOT NULL
     ORDER BY act.occurred_at DESC
     LIMIT 5`
  );

  const stockRow = stockOverviewRes.rows[0] || {};

  return {
    kpi: {
      totalProducts: totalProductsRes.rows[0]?.total_products ?? 0,
      transactionsThisMonth:
        transactionsMonthRes.rows[0]?.transactions_this_month ?? 0,
      inventoryValue: Number(inventoryValueRes.rows[0]?.inventory_value ?? 0),
      pendingSupplierApprovals: pendingSuppliersRes.rows.length,
    },
    pendingSuppliers: pendingSuppliersRes.rows,
    inventoryOverview: {
      totalProducts: stockRow.total_products ?? 0,
      normal: stockRow.normal_count ?? 0,
      low: stockRow.low_count ?? 0,
      severe: stockRow.severe_count ?? 0,
      outOfStock: stockRow.out_of_stock_count ?? 0,
    },
    stockAlerts: stockAlertsRes.rows,
    recentTransactions: recentTransactionsRes.rows,
    recentActivities: recentActivitiesRes.rows,
  };
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  const data = await getAdminDashboardData();

  return (
    <AdminDashboardClient
      adminName={session.name || "Admin Tataloka"}
      userRole={session.role}
      initialKpi={data.kpi}
      initialPendingSuppliers={data.pendingSuppliers}
      initialInventoryOverview={data.inventoryOverview}
      initialStockAlerts={data.stockAlerts}
      initialRecentTransactions={data.recentTransactions}
      initialRecentActivities={data.recentActivities}
    />
  );
}