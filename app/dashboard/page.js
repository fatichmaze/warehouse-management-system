import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  // Jika belum login, arahkan ke halaman login
  if (!session) {
    redirect("/login");
  }

  // Arahkan berdasarkan role pengguna
  if (session.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (session.role === "warehouse_manager") {
    redirect("/warehouse-manager/dashboard");
  }

  if (session.role === "staff") {
    redirect("/staff/dashboard");
  }

  if (session.role === "supplier") {
    redirect("/supplier/dashboard");
  }

  // Jika role tidak dikenali
  redirect("/login");
}
