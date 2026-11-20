import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";
import AdminProductsClient from "@/components/dashboard/admin/products/AdminProductsClient";

const ALLOWED_ROLES = ["admin", "warehouse_manager"];

async function getProductsPageData() {
  const productsRes = await pool.query(
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
     ORDER BY p.created_at DESC, p.id DESC`
  );

  const categoriesRes = await pool.query(
    `SELECT id, name
     FROM categories
     ORDER BY name ASC`
  );

  return {
    products: productsRes.rows,
    categories: categoriesRes.rows,
  };
}

export default async function AdminProductsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!ALLOWED_ROLES.includes(session.role)) {
    redirect("/dashboard");
  }

  const { products, categories } = await getProductsPageData();

  return (
    <AdminProductsClient
      userName={session.name || "Admin Tataloka"}
      initialProducts={products}
      initialCategories={categories}
    />
  );
}