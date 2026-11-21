import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";
import AdminSuppliersClient from "@/components/dashboard/admin/AdminSuppliersClient";

async function getPendingSuppliers() {
  const res = await pool.query(
    `SELECT id, name, email, company_name, status, created_at
     FROM users
     WHERE role = 'supplier' AND status = 'pending'
     ORDER BY created_at DESC`
  );

  return res.rows;
}

export default async function AdminSuppliersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  const initialPendingSuppliers = await getPendingSuppliers();

  return (
    <AdminSuppliersClient
      adminName={session.name || "Admin Tataloka"}
      initialPendingSuppliers={initialPendingSuppliers}
    />
  );
}
