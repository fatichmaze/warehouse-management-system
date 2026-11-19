"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Tags,
  ArrowLeftRight,
  ClipboardList,
  Users,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { label: "Restock Orders", href: "/admin/restock-orders", icon: ClipboardList },
  { label: "Users", href: "/admin/users", icon: Users, showPendingBadge: true },
];

export default function AdminSidebar({ pendingCount = 0 }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout gagal:", error);
      setLoggingOut(false);
    }
  }

  return (
    <aside className="w-[228px] shrink-0 bg-white rounded-[28px] border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col justify-between px-3.5 py-6 self-stretch">
      <div>
        <div className="px-2 mb-7">
          <Link href="/admin/dashboard" className="inline-flex items-center">
            <img
              src="/logo.png"
              alt="TATALOKA - Kelola Gudang, Lebih Tertata."
              className="h-11 w-auto max-w-[188px] object-contain"
            />
          </Link>
        </div>

        <nav aria-label="Navigasi Admin" className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-colors ${
                  isActive
                    ? "bg-[#F7EFE3] text-[#30465B] font-semibold"
                    : "text-[#637587] hover:bg-[#F7F9FA] font-medium"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#30465B]" : "text-[#8998A5]"
                    }`}
                    strokeWidth={1.8}
                  />
                  <span>{item.label}</span>
                </span>

                {item.showPendingBadge && pendingCount > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#E99A4A] text-white text-[11px] font-semibold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6">
        <div className="rounded-2xl bg-[#2D4356] text-white p-4 shadow-[0_8px_20px_rgba(45,67,86,0.14)]">
          <div className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center mx-auto mb-2.5">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.9} />
          </div>
          <p className="text-[12px] font-bold text-white text-center">
            Sesi Admin Aktif
          </p>
          <p className="text-[11px] text-[#CBD7E2] text-center mt-1 leading-snug">
            Anda masuk sebagai administrator sistem.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-3.5 w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F7F9FA] disabled:opacity-60 text-[#30465B] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{loggingOut ? "Keluar..." : "Logout"}</span>
            <LogOut className="w-3.5 h-3.5 text-[#30465B]" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );
}