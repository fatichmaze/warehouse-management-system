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
     WHERE DATE_TRUNC('month', transaction_date::timestamp) =
           DATE_TRUNC('month', CURRENT_DATE::timestamp)`
  );

  const inventoryValueRes = await pool.query(
    `SELECT COALESCE(
       SUM(COALESCE(purchase_price, 0) * COALESCE(current_stock, 0)), 0
     )::numeric AS inventory_value
     FROM products`
  );

  const pendingSuppliersRes = await pool.query(
    `SELECT id, name, email, company_name, status, created_at
     FROM users
     WHERE role = 'supplier' AND status = 'pending'
     ORDER BY created_at DESC`
  );

  return {
    kpi: {
      totalProducts: totalProductsRes.rows[0]?.total_products ?? 0,
      transactionsThisMonth:
        transactionsMonthRes.rows[0]?.transactions_this_month ?? 0,
      inventoryValue: Number(
        inventoryValueRes.rows[0]?.inventory_value ?? 0
      ),
      pendingSupplierApprovals: pendingSuppliersRes.rows.length,
    },
    pendingSuppliers: pendingSuppliersRes.rows,
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
    />
  );
}
