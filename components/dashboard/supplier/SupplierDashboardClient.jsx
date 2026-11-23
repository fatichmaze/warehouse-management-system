"use client";

import Link from "next/link";
import {
  ClipboardList,
  Clock3,
  Truck,
  PackageCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";

  let date;

  if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  }

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  Pending: "bg-[#F7EFE3] text-[#8C5A1E]",
  Confirmed: "bg-[#DCEAF3] text-[#527DA3]",
  Rejected: "bg-[#FDECEC] text-[#C53030]",
  "In Transit": "bg-[#E8EEF8] text-[#30465B]",
  Received: "bg-[#EAF6EE] text-[#2F855A]",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
        STATUS_STYLES[status] || "bg-[#F7F9FA] text-[#637587]"
      }`}
    >
      {status}
    </span>
  );
}

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#E8EEF4] bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#8998A5]">
            {title}
          </p>

          <p className="mt-2 text-[24px] sm:text-[28px] leading-tight font-bold text-[#30465B]">
            {formatNumber(value)}
          </p>

          <p className="mt-1 text-[11px] text-[#8998A5]">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCEAF3] text-[#527DA3]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-[#DCE6EF] bg-[#F8FAFC] px-4 py-9 text-center">
      <PackageCheck
        size={27}
        className="mx-auto mb-2 text-[#8998A5]"
      />

      <p className="text-[12px] text-[#8998A5]">
        {message}
      </p>
    </div>
  );
}

export default function SupplierDashboardClient({
  supplierName,
  dashboardData,
}) {
  const {
    summary,
    pendingOrders,
    orderHistory,
  } = dashboardData;

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] p-3 text-[#30465B] sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-350 flex-col items-start gap-4 md:flex-row">
        <AdminSidebar role="supplier" />

        <div className="flex min-w-0 w-full max-w-full flex-1 flex-col rounded-[28px] border border-white/90 bg-white/95 shadow-[0_14px_36px_rgba(48,70,91,0.08)]">
          <AdminTopbar
            adminName={supplierName}
            role="supplier"
            currentSection="Dashboard"
          />

          <main className="min-w-0 flex-1 space-y-4 sm:space-y-5 px-4 pb-6 sm:pb-7 pt-2.5 sm:pt-3 sm:px-7">
            {/* Header */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h1
                  className="text-[26px] sm:text-[34px] leading-[1.12] sm:leading-[1.08] font-bold tracking-tight text-[#30465B]"
                  style={{
                    fontFamily: "var(--font-bricolage), sans-serif",
                  }}
                >
                  Dashboard Supplier
                </h1>

                <p className="mt-1.5 text-[12px] text-[#8998A5]">
                  Pantau pesanan pengadaan dan status pengiriman Anda.
                </p>
              </div>

              <Link
                href="/supplier/restock-orders"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#527DA3] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#426B90]"
              >
                <ClipboardList size={15} />
                Restock Orders
              </Link>
            </div>

            {/* Summary */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Restock Order"
                value={summary.total}
                description="Seluruh pesanan Anda"
                icon={ClipboardList}
              />

              <SummaryCard
                title="Menunggu Konfirmasi"
                value={summary.pending}
                description="Pesanan yang perlu ditanggapi"
                icon={Clock3}
              />

              <SummaryCard
                title="Dalam Pengiriman"
                value={summary.inTransit}
                description="Pesanan sedang dikirim"
                icon={Truck}
              />

              <SummaryCard
                title="Pesanan Diterima"
                value={summary.received}
                description="Pesanan selesai diterima"
                icon={PackageCheck}
              />
            </section>

            {/* Pending Orders */}
            <section className="rounded-2xl border border-[#E8EEF4] bg-white p-4 sm:p-5">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-[16px] font-bold text-[#30465B]">
                    Restock Orders yang Perlu Dikonfirmasi
                  </h2>

                  <p className="mt-1 text-[11px] text-[#8998A5]">
                    Pesanan Pending yang membutuhkan tanggapan Anda.
                  </p>
                </div>

                <Link
                  href="/supplier/restock-orders"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#527DA3] hover:text-[#30465B]"
                >
                  Lihat Semua <ArrowRight size={14} />
                </Link>
              </div>

              {pendingOrders.length === 0 ? (
                <EmptyState message="Tidak ada pesanan yang menunggu konfirmasi." />
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-[#E8EEF4] bg-[#F8FAFC] p-3.5 sm:p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-[13px] font-bold text-[#30465B]">
                          {order.po_number}
                        </p>

                        <p className="mt-1 text-[11px] text-[#8998A5]">
                          Tanggal pesanan: {formatDate(order.order_date)}
                        </p>

                        <p className="mt-1 text-[11px] text-[#8998A5]">
                          Estimasi tiba: {formatDate(order.expected_delivery_date)}
                        </p>

                        <p className="mt-1 text-[11px] text-[#8998A5]">
                          {formatNumber(order.item_count)} jenis produk
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />

                        <Link
                          href="/supplier/restock-orders"
                          className="inline-flex items-center gap-1 rounded-xl bg-[#527DA3] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#426B90]"
                        >
                          Detail <ExternalLink size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Shipment History */}
            <section className="rounded-2xl border border-[#E8EEF4] bg-white p-4 sm:p-5">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-[16px] font-bold text-[#30465B]">
                    Riwayat Pengiriman ke Gudang
                  </h2>

                  <p className="mt-1 text-[11px] text-[#8998A5]">
                    Pesanan yang telah dikonfirmasi atau diproses.
                  </p>
                </div>

                <Link
                  href="/supplier/restock-orders"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#527DA3] hover:text-[#30465B]"
                >
                  Lihat Semua <ArrowRight size={14} />
                </Link>
              </div>

              {orderHistory.length === 0 ? (
                <EmptyState message="Belum ada riwayat pengiriman ke gudang." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-140 text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#E8EEF4] text-[10px] uppercase tracking-wider text-[#8998A5]">
                        <th className="px-3 py-3 font-semibold">
                          Nomor PO
                        </th>

                        <th className="px-3 py-3 font-semibold">
                          Tanggal Pesan
                        </th>

                        <th className="px-3 py-3 font-semibold">
                          Estimasi Tiba
                        </th>

                        <th className="px-3 py-3 font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderHistory.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-[#F1F5F9] last:border-0"
                        >
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#30465B]">
                            {order.po_number}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-[#637587]">
                            {formatDate(order.order_date)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-[#637587]">
                            {formatDate(order.expected_delivery_date)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            <StatusBadge status={order.status} />
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