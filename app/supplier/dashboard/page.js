import { requirePageRole } from "@/lib/page-auth";
import pool from "@/lib/db";
import SupplierDashboardClient from "@/components/dashboard/supplier/SupplierDashboardClient";

async function getSupplierDashboardData(supplierId) {
  const [summaryResult, pendingResult, historyResult] =
    await Promise.all([
      pool.query(
        `
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending,
            COUNT(*) FILTER (WHERE status = 'In Transit')::int AS in_transit,
            COUNT(*) FILTER (WHERE status = 'Received')::int AS received
          FROM restock_orders
          WHERE supplier_id = $1
        `,
        [supplierId]
      ),

      pool.query(
        `
          SELECT
            id,
            po_number,
            order_date,
            expected_delivery_date,
            status,
            (
              SELECT COUNT(*)::int
              FROM restock_order_items roi
              WHERE roi.restock_order_id = ro.id
            ) AS item_count
          FROM restock_orders ro
          WHERE supplier_id = $1
            AND status = 'Pending'
          ORDER BY created_at DESC, id DESC
          LIMIT 5
        `,
        [supplierId]
      ),

      pool.query(
        `
          SELECT
            id,
            po_number,
            order_date,
            expected_delivery_date,
            status
          FROM restock_orders
          WHERE supplier_id = $1
            AND status IN ('Confirmed', 'In Transit', 'Received')
          ORDER BY created_at DESC, id DESC
          LIMIT 8
        `,
        [supplierId]
      ),
    ]);

  const summary = summaryResult.rows[0];

  return {
    summary: {
      total: summary.total,
      pending: summary.pending,
      inTransit: summary.in_transit,
      received: summary.received,
    },
    pendingOrders: pendingResult.rows,
    orderHistory: historyResult.rows,
  };
}

export default async function SupplierDashboardPage() {
  const user = await requirePageRole(["supplier"]);

  const dashboardData = await getSupplierDashboardData(user.id);

  return (
    <SupplierDashboardClient
      supplierName={user.name}
      dashboardData={dashboardData}
    />
  );
}
