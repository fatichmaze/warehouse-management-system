"use client";

import Link from "next/link";
import {
  Package,
  Boxes,
  ClipboardCheck,
  Truck,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
} from "lucide-react";

import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";

  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SummaryCard({ title, value, description, icon: Icon, href }) {
  return (
    <Link
      href={href}
      className="min-w-0 rounded-[20px] border border-[#E8EEF4] bg-white p-5 shadow-[0_4px_14px_rgba(48,70,91,0.04)] transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#8998A5]">{title}</p>
          <p className="mt-2 text-[28px] font-bold tracking-tight text-[#30465B]">
            {formatNumber(value)}
          </p>
          <p className="mt-1 text-[11px] text-[#8998A5]">{description}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCEAF3] text-[#527DA3]">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-[#FFF3DF] text-[#B7791F]",
    Approved: "bg-[#E4F4EA] text-[#37845A]",
    Rejected: "bg-[#FCE8E8] text-[#C05656]",
    Shipped: "bg-[#E6EDF8] text-[#527DA3]",
    Confirmed: "bg-[#E4F4EA] text-[#37845A]",
    "In Transit": "bg-[#E6EDF8] text-[#527DA3]",
    Received: "bg-[#E4F4EA] text-[#37845A]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] || "bg-[#F1F4F6] text-[#637587]"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-[12px] text-[#8998A5]">{message}</p>
    </div>
  );
}

export default function ManagerDashboardClient({
  managerName,
  userRole,
  dashboardData,
}) {
  const data = dashboardData || {};
  const stock = data.stockOverview || {};

  const recentTransactions = Array.isArray(data.recentTransactions)
    ? data.recentTransactions
    : [];

  const pendingTransactions = Array.isArray(data.pendingTransactionList)
    ? data.pendingTransactionList
    : [];

  const ongoingRestockOrders = Array.isArray(data.ongoingRestockList)
    ? data.ongoingRestockList
    : [];

  const stockItems = [
    {
      label: "Stok Normal",
      value: Math.max(
        0,
        Number(data.totalProducts || 0) -
          Number(stock.outOfStock || 0) -
          Number(stock.severe || 0) -
          Number(stock.low || 0)
      ),
      color: "bg-[#65A982]",
    },
    {
      label: "Low Stock",
      value: stock.low,
      color: "bg-[#E9B65D]",
    },
    {
      label: "Severe Stock",
      value: stock.severe,
      color: "bg-[#E58B58]",
    },
    {
      label: "Out of Stock",
      value: stock.outOfStock,
      color: "bg-[#D66D6D]",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] p-3 text-[#30465B] sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-350 flex-col items-start gap-4 md:flex-row">
        <AdminSidebar role={userRole} />

        <div className="flex min-w-0 w-full max-w-full flex-1 flex-col rounded-[28px] border border-white/90 bg-white/95 shadow-[0_14px_36px_rgba(48,70,91,0.08)]">
          <AdminTopbar
            adminName={managerName}
            role={userRole}
            currentSection="Dashboard"
          />

          <main className="min-w-0 flex-1 space-y-6 px-5 pb-7 pt-3 sm:px-7">
            {/* Heading */}
            <section>
              <h1
                className="text-[34px] font-bold leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                <span className="block text-[#30465B]">Dashboard</span>
                <span className="block text-[#527DA3]">
                  Warehouse Manager
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-[#8998A5]">
                Pantau kondisi stok, persetujuan transaksi, dan proses
                pengadaan barang gudang.
              </p>
            </section>

            {/* Summary */}
            <section>
              <h2 className="mb-3 text-[14px] font-bold text-[#30465B]">
                Ringkasan Gudang
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  title="Total Produk"
                  value={data.totalProducts}
                  description="Produk terdaftar"
                  icon={Package}
                  href="/admin/products"
                />

                <SummaryCard
                  title="Total Stok"
                  value={data.totalStock}
                  description="Akumulasi stok seluruh produk"
                  icon={Boxes}
                  href="/admin/products"
                />

                <SummaryCard
                  title="Transaksi Pending"
                  value={data.pendingTransactions}
                  description="Menunggu persetujuan"
                  icon={ClipboardCheck}
                  href="/warehouse-manager/transactions"
                />

                <SummaryCard
                  title="Restock Berjalan"
                  value={data.ongoingRestockOrders}
                  description="Pending, Confirmed, dan In Transit"
                  icon={Truck}
                  href="/warehouse-manager/restock-orders"
                />
              </div>
            </section>

            {/* Stock Overview */}
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-[20px] border border-[#E8EEF4] bg-white p-5">
                  <div className="mb-4">
                    <h2 className="text-[14px] font-bold text-[#30465B]">
                      Kondisi Stok
                    </h2>
                    <p className="mt-1 text-[11px] text-[#8998A5]">
                      Ringkasan kondisi persediaan produk
                    </p>
                  </div>

                  {stockItems.map((item) => (
                    <div key={item.label} className="mb-4 last:mb-0">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#637587]">
                          {item.label}
                        </span>
                        <span className="text-[12px] font-bold text-[#30465B]">
                          {formatNumber(item.value)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#F0F3F6]">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{
                            width: `${
                              Number(data.totalProducts) > 0
                                ? Math.min(
                                    100,
                                    (Number(item.value || 0) /
                                      Number(data.totalProducts)) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Access */}
                <div className="rounded-[20px] border border-[#E8EEF4] bg-[#F7FAFC] p-5">
                  <h2 className="text-[14px] font-bold text-[#30465B]">
                    Akses Cepat
                  </h2>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { label: "Produk", href: "/admin/products" },
                      { label: "Kategori", href: "/admin/categories" },
                      {
                        label: "Transaksi",
                        href: "/warehouse-manager/transactions",
                      },
                      {
                        label: "Restock",
                        href: "/warehouse-manager/restock-orders",
                      },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-between rounded-xl border border-[#E8EEF4] bg-white px-3 py-3 text-[11px] font-semibold text-[#527DA3] transition-colors hover:bg-[#F7EFE3]"
                      >
                        {item.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending Transactions */}
              <div className="min-w-0 overflow-hidden rounded-[20px] border border-[#E8EEF4] bg-white lg:col-span-7">
                <div className="flex items-center justify-between gap-3 border-b border-[#EDF1F5] px-5 py-4">
                  <div>
                    <h2 className="text-[14px] font-bold text-[#30465B]">
                      Pending Transactions
                    </h2>
                    <p className="mt-1 text-[11px] text-[#8998A5]">
                      Transaksi yang membutuhkan persetujuan
                    </p>
                  </div>

                  <Link
                    href="/warehouse-manager/transactions"
                    className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#527DA3] hover:text-[#30465B]"
                  >
                    Lihat semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {pendingTransactions.length === 0 ? (
                  <EmptyState message="Tidak ada transaksi yang menunggu persetujuan." />
                ) : (
                  <div className="divide-y divide-[#EDF1F5]">
                    {pendingTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3DF] text-[#B7791F]">
                            {transaction.type === "incoming" ? (
                              <ArrowDownToLine className="h-4 w-4" />
                            ) : (
                              <ArrowUpFromLine className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-bold text-[#30465B]">
                              {transaction.transaction_number}
                            </p>
                            <p className="mt-1 text-[10px] text-[#8998A5]">
                              {transaction.type === "incoming"
                                ? "Barang Masuk"
                                : "Barang Keluar"}{" "}
                              · {transaction.creator_name || "Pengguna"}
                            </p>
                            <p className="mt-1 text-[10px] text-[#637587]">
                              {formatDate(transaction.transaction_date)}
                              {" · "}
                              {formatNumber(transaction.total_quantity)} unit
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:shrink-0">
                          <StatusBadge status="Pending" />
                          <Link
                            href="/warehouse-manager/transactions"
                            className="text-[10px] font-semibold text-[#527DA3] hover:underline"
                          >
                            Periksa
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Ongoing Restock Orders */}
            <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#E8EEF4] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[#EDF1F5] px-5 py-4">
                <div>
                  <h2 className="text-[14px] font-bold text-[#30465B]">
                    Ongoing Restock Orders
                  </h2>
                  <p className="mt-1 text-[11px] text-[#8998A5]">
                    Pesanan restock yang sedang diproses
                  </p>
                </div>

                <Link
                  href="/warehouse-manager/restock-orders"
                  className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#527DA3] hover:text-[#30465B]"
                >
                  Lihat semua
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {ongoingRestockOrders.length === 0 ? (
                <EmptyState message="Belum ada restock order yang sedang berjalan." />
              ) : (
                <div className="divide-y divide-[#EDF1F5]">
                  {ongoingRestockOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCEAF3] text-[#527DA3]">
                          <Truck className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-[#30465B]">
                            {order.po_number}
                          </p>
                          <p className="mt-1 text-[10px] text-[#8998A5]">
                            {order.company_name || order.supplier_name || "Supplier"}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-[#637587]">
                            <CalendarDays className="h-3 w-3" />
                            Estimasi: {formatDate(order.expected_delivery_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:shrink-0">
                        <StatusBadge status={order.status} />
                        <Link
                          href="/warehouse-manager/restock-orders"
                          className="text-[10px] font-semibold text-[#527DA3] hover:underline"
                        >
                          Periksa
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Transactions */}
            <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#E8EEF4] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[#EDF1F5] px-5 py-4">
                <div>
                  <h2 className="text-[14px] font-bold text-[#30465B]">
                    Transaksi Terbaru
                  </h2>
                  <p className="mt-1 text-[11px] text-[#8998A5]">
                    Aktivitas transaksi gudang terakhir
                  </p>
                </div>

                <Link
                  href="/warehouse-manager/transactions"
                  className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#527DA3] hover:text-[#30465B]"
                >
                  Lihat semua
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <EmptyState message="Belum ada transaksi." />
              ) : (
                <div className="divide-y divide-[#EDF1F5]">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCEAF3] text-[#527DA3]">
                          {transaction.type === "incoming" ? (
                            <ArrowDownToLine className="h-4 w-4" />
                          ) : (
                            <ArrowUpFromLine className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-[#30465B]">
                            {transaction.transaction_number}
                          </p>
                          <p className="mt-1 text-[10px] text-[#8998A5]">
                            {transaction.type === "incoming"
                              ? "Barang Masuk"
                              : "Barang Keluar"}{" "}
                            · {transaction.creator_name || "Pengguna"} ·{" "}
                            {formatDate(transaction.transaction_date)}
                          </p>
                          <p className="mt-1 text-[10px] text-[#637587]">
                            {formatNumber(transaction.total_items)} produk
                            {" · "}
                            {formatNumber(transaction.total_quantity)} unit
                          </p>
                        </div>
                      </div>

                      <div className="sm:shrink-0">
                        <StatusBadge status={transaction.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
