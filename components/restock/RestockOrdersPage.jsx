import { requirePageRole } from "@/lib/page-auth";
import pool from "@/lib/db";
import RestockOrdersClient from "./RestockOrdersClient";

export default async function RestockOrdersPage({ role }) {
  const user = await requirePageRole([role]);

  let suppliers = [];
  let products = [];

  if (user.role === "warehouse_manager") {
    const [supplierResult, productResult] = await Promise.all([
      pool.query(
        `SELECT id, name, company_name
         FROM users
         WHERE role = 'supplier'
           AND status = 'approved'
         ORDER BY company_name ASC, name ASC`
      ),
      pool.query(
        `SELECT id, sku, name, current_stock, unit
         FROM products
         ORDER BY name ASC`
      ),
    ]);

    suppliers = supplierResult.rows;
    products = productResult.rows;
  }

  return (
    <RestockOrdersClient
      role={user.role}
      userId={user.id}
      userName={user.name}
      suppliers={suppliers}
      products={products}
    />
  );
}
