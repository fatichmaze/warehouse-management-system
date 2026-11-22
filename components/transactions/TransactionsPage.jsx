import pool from "@/lib/db";
import { requirePageRole } from "@/lib/page-auth";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage({
  role,
  initialTab = "incoming",
}) {
  const user = await requirePageRole([role]);

  const productsRes = await pool.query(
    `SELECT id, sku, name, unit, current_stock
     FROM products
     ORDER BY name ASC`
  );

  let suppliers = [];
  let receivedOrders = [];

  if (role === "staff") {
    const suppliersRes = await pool.query(
      `SELECT id, COALESCE(company_name, name) AS name
       FROM users
       WHERE role = 'supplier' AND status = 'approved'
       ORDER BY 2 ASC`
    );
    suppliers = suppliersRes.rows;

    const poRes = await pool.query(
      `SELECT
         ro.id,
         ro.po_number,
         ro.supplier_id,
         COALESCE(s.company_name, s.name) AS supplier_name,
         COALESCE(
           json_agg(
             json_build_object('product_id', i.product_id, 'quantity', i.quantity)
             ORDER BY i.product_id
           ) FILTER (WHERE i.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM restock_orders ro
       INNER JOIN users s ON s.id = ro.supplier_id
       LEFT JOIN restock_order_items i ON i.restock_order_id = ro.id
       WHERE ro.status = 'Received'
         AND NOT EXISTS (
           SELECT 1 FROM transactions t
           WHERE t.restock_order_id = ro.id AND t.status <> 'Rejected'
         )
       GROUP BY ro.id, s.company_name, s.name
       ORDER BY ro.id DESC`
    );
    receivedOrders = poRes.rows;
  }

    return (
    <TransactionsClient
        key={initialTab}
        role={user.role}
        userId={user.id}
        userName={user.name}
        products={productsRes.rows}
        suppliers={suppliers}
        receivedOrders={receivedOrders}
        initialTab={initialTab}
    />
    );
}
