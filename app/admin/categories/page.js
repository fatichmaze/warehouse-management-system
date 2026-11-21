import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";
import AdminCategoriesClient from "@/components/dashboard/admin/categories/AdminCategoriesClient";

const ALLOWED_ROLES = ["admin", "warehouse_manager"];

async function getCategoriesPageData() {
  const categoriesRes = await pool.query(
    `SELECT
       c.id,
       c.name,
       c.description,
       c.image_url,
       c.created_at,
       COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id, c.name, c.description, c.image_url, c.created_at
     ORDER BY c.name ASC, c.id ASC`
  );

  const summaryRes = await pool.query(
    `WITH category_product_counts AS (
       SELECT
         c.id,
         COUNT(p.id)::int AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
     )
     SELECT
       COUNT(*)::int AS total_categories,
       COUNT(*) FILTER (WHERE product_count > 0)::int AS with_products_count,
       COUNT(*) FILTER (WHERE product_count = 0)::int AS empty_categories_count
     FROM category_product_counts`
  );

  const summaryRow = summaryRes.rows[0] || {};

  const summary = {
    totalCategories: Number(summaryRow.total_categories ?? 0),
    categoriesWithProducts: Number(summaryRow.with_products_count ?? 0),
    emptyCategories: Number(summaryRow.empty_categories_count ?? 0),
  };

  return {
    categories: categoriesRes.rows,
    summary,
  };
}

export default async function AdminCategoriesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = String(session.role ?? "").toLowerCase();
  if (!ALLOWED_ROLES.includes(role)) {
    redirect("/dashboard");
  }

  const { categories, summary } = await getCategoriesPageData();

  return (
    <AdminCategoriesClient
      userName={session.name || "Admin Tataloka"}
      userRole={role}
      initialCategories={categories}
      initialSummary={summary}
    />
  );
}