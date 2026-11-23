import { requirePageRole } from "@/lib/page-auth";
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
  const user = await requirePageRole(["admin"]);

  const initialPendingSuppliers = await getPendingSuppliers();

  return (
    <AdminSuppliersClient
      adminName={user.name || "Admin Tataloka"}
      userRole={user.role}
      initialPendingSuppliers={initialPendingSuppliers}
    />
  );
}