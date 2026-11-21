import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  warehouse_manager: "/warehouse-manager/dashboard",
  staff: "/staff/dashboard",
  supplier: "/supplier/dashboard",
};

export function getRoleHome(role) {
  return ROLE_HOME[role] ?? "/login";
}

// Query user terbaru hanya sekali per request halaman.
const getFreshUser = cache(async (userId) => {
  const result = await pool.query(
    `SELECT id, name, email, role, status
     FROM users
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0] ?? null;
});

export async function requirePageRole(allowedRoles) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userId = Number(session.userId);

  // Validasi sebelum query database
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    redirect("/login");
  }

  const user = await getFreshUser(userId);

  if (!user) {
    redirect("/login");
  }

  if (user.status === "pending") {
    redirect("/login?reason=pending");
  }

  if (user.status === "rejected") {
    redirect("/login?reason=rejected");
  }

  if (user.status !== "approved") {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect(getRoleHome(user.role));
  }

  return user;
}