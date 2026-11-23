import { requirePageRole } from "@/lib/page-auth";
import pool from "@/lib/db";
import AdminProductsClient from "@/components/dashboard/admin/products/AdminProductsClient";

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

  const summaryRes = await pool.query(
    `SELECT
       COUNT(*) AS total_products,
       COUNT(*) FILTER (WHERE current_stock > low_stock) AS normal_count,
       COUNT(*) FILTER (
         WHERE current_stock > min_stock AND current_stock <= low_stock
       ) AS low_stock_count,
       COUNT(*) FILTER (
         WHERE current_stock > 0 AND current_stock <= min_stock
       ) AS severe_count,
       COUNT(*) FILTER (WHERE current_stock = 0) AS out_of_stock_count
     FROM products`
  );

  const row = summaryRes.rows[0] || {};

  const summary = {
    totalProducts: Number(row.total_products ?? 0),
    normal: Number(row.normal_count ?? 0),
    lowStock: Number(row.low_stock_count ?? 0),
    severe: Number(row.severe_count ?? 0),
    outOfStock: Number(row.out_of_stock_count ?? 0),
  };

  return {
    products: productsRes.rows,
    categories: categoriesRes.rows,
    summary,
  };
}

export default async function AdminProductsPage() {
  const user = await requirePageRole(["admin", "warehouse_manager"]);

  const { products, categories, summary } = await getProductsPageData();

  return (
    <AdminProductsClient
      userName={user.name || "Admin Tataloka"}
      userRole={user.role}
      initialProducts={products}
      initialCategories={categories}
      initialSummary={summary}
    />
  );
}