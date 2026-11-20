import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";
import ProductDetailsClient from "@/components/dashboard/admin/products/ProductDetailsClient";

const ALLOWED_ROLES = ["admin", "warehouse_manager"];

function parseSafePositiveInt(rawId) {
  if (typeof rawId !== "string" && typeof rawId !== "number") {
    return null;
  }

  const trimmed = String(rawId).trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

async function getProductDetailsData(productId) {
  const productRes = await pool.query(
    `SELECT
       p.id,
       p.sku,
       p.name,
       p.category_id,
       c.name AS category_name,
       p.description,
       p.purchase_price,
       p.selling_price,
       p.min_stock,
       p.low_stock,
       p.current_stock,
       p.unit,
       p.rack_location,
       p.image_url,
       p.created_at
     FROM products p
     INNER JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1`,
    [productId]
  );

  if (productRes.rowCount === 0) {
    return null;
  }

  const transactionsRes = await pool.query(
    `SELECT
       ti.id AS transaction_item_id,
       ti.transaction_id,
       ti.quantity,
       t.transaction_number,
       t.type,
       t.transaction_date,
       t.restock_order_id,
       t.supplier_id,
       t.customer_destination,
       t.notes,
       t.status,
       t.rejection_reason,
       t.created_at AS transaction_created_at
     FROM transaction_items ti
     INNER JOIN transactions t ON t.id = ti.transaction_id
     WHERE ti.product_id = $1
     ORDER BY t.transaction_date DESC, t.created_at DESC, t.id DESC
     LIMIT 5`,
    [productId]
  );

  return {
    product: productRes.rows[0],
    recentTransactions: transactionsRes.rows,
  };
}

export default async function ProductDetailsPage({ params }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = String(session.role ?? "").toLowerCase();
  if (!ALLOWED_ROLES.includes(role)) {
    redirect("/dashboard");
  }

  const resolvedParams = await params;
  const productId = parseSafePositiveInt(resolvedParams?.id);

  if (!productId) {
    notFound();
  }

  const data = await getProductDetailsData(productId);

  if (!data) {
    notFound();
  }

  return (
    <ProductDetailsClient
      userName={session.name || "Admin Tataloka"}
      userRole={role}
      product={data.product}
      recentTransactions={data.recentTransactions}
    />
  );
}