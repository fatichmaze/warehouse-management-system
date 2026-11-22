"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  Package,
  ArrowRight,
} from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-[#F7EFE3] text-[#8C5A1E]",
    Approved: "bg-[#EAF6EE] text-[#2F855A]",
    Rejected: "bg-[#FDECEC] text-[#C53030]",
    Shipped: "bg-[#DCEAF3] text-[#527DA3]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
        styles[status] || "bg-[#F7F9FA] text-[#637587]"
      }`}
    >
      {status}
    </span>
  );
}

export default function StaffDashboardClient({
  userName,
  summary = { total: 0, incoming: 0, outgoing: 0 },
  todayTransactions = [],
}) {
  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-3 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 mx-auto flex flex-col md:flex-row items-start gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar role="staff" />

        <div className="flex-1 min-w-0 rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar
            role="staff"
            adminName={userName}
            currentSection="Dashboard"
          />

          <main className="flex-1 px-7 pt-3 pb-7 space-y-5">
            <section>
              <p className="text-[12px] font-medium text-[#8998A5]">
                Staff Gudang
              </p>
              <h1
                className="mt-1 text-[34px] leading-[1.08] font-bold tracking-tight text-[#30465B]"
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                Dashboard
              </h1>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#8998A5]">
                Kelola transaksi barang masuk dan keluar gudang.
              </p>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E8EEF4] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-[#8998A5]">
                    Transaksi Hari Ini
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-[#DCEAF3] text-[#527DA3] flex items-center justify-center">
                    <ClipboardList size={18} strokeWidth={1.9} />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#30465B]">
                  {summary?.total ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8EEF4] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-[#8998A5]">
                    Barang Masuk
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-[#EAF6EE] text-[#2F855A] flex items-center justify-center">
                    <ArrowDownToLine size={18} strokeWidth={1.9} />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#30465B]">
                  {summary?.incoming ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8EEF4] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-[#8998A5]">
                    Barang Keluar
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-[#F7EFE3] text-[#8C5A1E] flex items-center justify-center">
                    <ArrowUpFromLine size={18} strokeWidth={1.9} />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#30465B]">
                  {summary?.outgoing ?? 0}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E8EEF4] bg-white p-5 sm:p-6">
              <div className="mb-4">
                <h2
                  className="text-[18px] font-bold text-[#30465B]"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Quick Entry
                </h2>
                <p className="mt-1 text-[12px] text-[#8998A5]">
                  Buat transaksi barang masuk atau barang keluar.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/staff/transactions?type=incoming"
                  className="group flex items-center justify-between rounded-2xl border border-[#DCE6EF] bg-[#F8FAFC] p-4 transition hover:border-[#527DA3] hover:bg-[#DCEAF3]/45"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="rounded-xl bg-[#EAF6EE] p-3 text-[#2F855A]">
                      <ArrowDownToLine size={20} strokeWidth={1.9} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#30465B]">
                        Barang Masuk
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#8998A5]">
                        Catat penerimaan barang
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-[#527DA3] transition group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/staff/transactions?type=outgoing"
                  className="group flex items-center justify-between rounded-2xl border border-[#DCE6EF] bg-[#F8FAFC] p-4 transition hover:border-[#527DA3] hover:bg-[#F7EFE3]/65"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="rounded-xl bg-[#F7EFE3] p-3 text-[#8C5A1E]">
                      <ArrowUpFromLine size={20} strokeWidth={1.9} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#30465B]">
                        Barang Keluar
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#8998A5]">
                        Catat pengeluaran barang
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-[#527DA3] transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#E8EEF4] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] px-5 py-4 sm:px-6">
                <div>
                  <h2
                    className="text-[18px] font-bold text-[#30465B]"
                    style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                  >
                    Transaksi Hari Ini
                  </h2>
                  <p className="mt-0.5 text-[12px] text-[#8998A5]">
                    Daftar transaksi yang kamu buat hari ini.
                  </p>
                </div>

                <Link
                  href="/staff/transactions"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#527DA3] hover:text-[#30465B]"
                >
                  Lihat Semua <ArrowRight size={15} />
                </Link>
              </div>

              {todayTransactions.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-10 text-center">
                  <div className="rounded-full bg-[#F7F9FA] p-3.5">
                    <Package size={24} className="text-[#8998A5]" />
                  </div>
                  <p className="mt-3 text-[13px] font-semibold text-[#30465B]">
                    Belum ada transaksi hari ini
                  </p>
                  <p className="mt-1 text-[12px] text-[#8998A5]">
                    Transaksi yang kamu buat hari ini akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-[13px]">
                    <thead>
                      <tr className="bg-[#F7F9FA] text-[10.5px] uppercase tracking-wider text-[#8998A5]">
                        <th className="px-5 py-3 font-semibold">Nomor Transaksi</th>
                        <th className="px-5 py-3 font-semibold">Jenis</th>
                        <th className="px-5 py-3 font-semibold">Tujuan / Supplier</th>
                        <th className="px-5 py-3 font-semibold">Jumlah Item</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]"
                        >
                          <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#30465B]">
                            {transaction.transaction_number}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3">
                            {transaction.type === "incoming" ? (
                              <span className="font-medium text-[#2F855A]">
                                Barang Masuk
                              </span>
                            ) : (
                              <span className="font-medium text-[#8C5A1E]">
                                Barang Keluar
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-[#637587]">
                            {transaction.supplier_name ||
                              transaction.customer_destination ||
                              "-"}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-[#637587]">
                            {transaction.item_count} item
                          </td>
                          <td className="whitespace-nowrap px-5 py-3">
                            <StatusBadge status={transaction.status} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-[#637587]">
                            {formatDate(transaction.transaction_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}