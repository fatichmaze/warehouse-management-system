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
      initialKpi={data.kpi}
      initialPendingSuppliers={data.pendingSuppliers}
      initialInventoryOverview={data.inventoryOverview}
    />
  );
}