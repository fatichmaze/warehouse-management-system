import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import AdminKpiCards from "@/components/dashboard/admin/AdminKpiCards";

async function getAdminKpiData() {
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
    `SELECT COUNT(*)::int AS pending_count
     FROM users
     WHERE role = 'supplier' AND status = 'pending'`
  );

  return {
    totalProducts: totalProductsRes.rows[0]?.total_products ?? 0,
    transactionsThisMonth:
      transactionsMonthRes.rows[0]?.transactions_this_month ?? 0,
    inventoryValue: Number(inventoryValueRes.rows[0]?.inventory_value ?? 0),
    pendingSupplierApprovals: pendingSuppliersRes.rows[0]?.pending_count ?? 0,
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

  const kpi = await getAdminKpiData();

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar pendingCount={kpi.pendingSupplierApprovals} />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col overflow-hidden">
          <AdminTopbar adminName={session.name || "Admin Tataloka"} />

          <main className="flex-1 px-7 pt-3 pb-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-4 pt-1">
                <h1
                  className="text-[34px] leading-[1.08] font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  <span className="text-[#30465B] block">Dashboard</span>
                  <span className="text-[#527DA3] block">Overview</span>
                </h1>

                <p className="mt-2.5 text-[12px] leading-relaxed text-[#8998A5] max-w-[270px]">
                  Pantau dan kelola seluruh aktivitas sistem gudang Anda.
                </p>
              </div>

              <div className="lg:col-span-8">
                <AdminKpiCards
                  totalProducts={kpi.totalProducts}
                  transactionsThisMonth={kpi.transactionsThisMonth}
                  inventoryValue={kpi.inventoryValue}
                  pendingSupplierApprovals={kpi.pendingSupplierApprovals}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}