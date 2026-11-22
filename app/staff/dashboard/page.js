import pool from "@/lib/db";
import { requirePageRole } from "@/lib/page-auth";
import StaffDashboardClient from "@/components/dashboard/staff/StaffDashboardClient";

export default async function StaffDashboardPage() {
  const user = await requirePageRole(["staff"]);

  const [summaryResult, transactionsResult] = await Promise.all([
    pool.query(
      `
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE type = 'incoming')::int AS incoming,
          COUNT(*) FILTER (WHERE type = 'outgoing')::int AS outgoing
        FROM transactions
        WHERE created_by = $1
          AND transaction_date = CURRENT_DATE
      `,
      [user.id]
    ),

    pool.query(
      `
        SELECT
          t.id,
          t.transaction_number,
          t.type,
          to_char(t.transaction_date, 'YYYY-MM-DD') AS transaction_date,
          t.status,
          t.customer_destination,
          COALESCE(s.company_name, s.name) AS supplier_name,
          (
            SELECT COUNT(*)::int
            FROM transaction_items ti
            WHERE ti.transaction_id = t.id
          ) AS item_count
        FROM transactions t
        LEFT JOIN users s ON s.id = t.supplier_id
        WHERE t.created_by = $1
          AND t.transaction_date = CURRENT_DATE
        ORDER BY t.id DESC
        LIMIT 10
      `,
      [user.id]
    ),
  ]);

  return (
    <StaffDashboardClient
      userName={user.name}
      summary={summaryResult.rows[0]}
      todayTransactions={transactionsResult.rows}
    />
  );
}
