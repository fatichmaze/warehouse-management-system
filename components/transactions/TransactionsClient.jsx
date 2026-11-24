"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopbar from "@/components/dashboard/admin/AdminTopbar";
import TransactionStatusBadge from "./TransactionStatusBadge";
import TransactionDetailModal from "./TransactionsDetailModal";
import TransactionFormModal from "./TransactionsFormModal";
import { callApi, formatDateId } from "./api";

const PAGE_SIZE = 10;

const DEFAULT_TABS = [
  { key: "incoming", label: "Barang Masuk" },
  { key: "outgoing", label: "Barang Keluar" },
];

const READ_ONLY_TABS = [
  { key: "all", label: "Semua" },
  { key: "incoming", label: "Barang Masuk" },
  { key: "outgoing", label: "Barang Keluar" },
];

const STATUS_OPTIONS = {
  all: ["Pending", "Approved", "Rejected", "Shipped"],
  incoming: ["Pending", "Approved", "Rejected"],
  outgoing: ["Pending", "Approved", "Rejected", "Shipped"],
};

const SORT_OPTIONS = [
  { value: "date_desc", label: "Tanggal terbaru" },
  { value: "date_asc", label: "Tanggal terlama" },
  { value: "number_asc", label: "No. transaksi A-Z" },
  { value: "number_desc", label: "No. transaksi Z-A" },
];

const fieldCls =
  "rounded-xl border border-[#DCE6EF] bg-white px-3.5 py-2 text-[12px] text-[#30465B] placeholder:text-[#8998A5] outline-none focus:border-[#527DA3]";

function resolveInitialTab(initialTab, readOnly) {
  if (readOnly && initialTab === "all") return "all";
  return initialTab === "outgoing" ? "outgoing" : "incoming";
}

function getTypeBadgeMeta(type) {
  if (type === "incoming") {
    return {
      label: "Barang Masuk",
      className: "bg-[#EBF5FF] text-[#2B6CB0] border border-[#BEE3F8]",
    };
  }
  return {
    label: "Barang Keluar",
    className: "bg-[#FFF5EB] text-[#B75A14] border border-[#FBD38D]",
  };
}

export default function TransactionsClient({
  role,
  userId,
  userName,
  products,
  suppliers,
  receivedOrders,
  initialTab = "incoming",
  readOnly = false,
}) {
  const router = useRouter();
  const isStaff = !readOnly && role === "staff";
  const tabs = readOnly ? READ_ONLY_TABS : DEFAULT_TABS;
  const columnCount = readOnly ? 8 : 7;

  const [tab, setTab] = useState(() => resolveInitialTab(initialTab, readOnly));
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [partyInput, setPartyInput] = useState("");
  const [party, setParty] = useState("");
  const [page, setPage] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);

  const [detailId, setDetailId] = useState(null);
  const [formState, setFormState] = useState(null);
  const [flash, setFlash] = useState("");

  const queryString = useMemo(() => {
    const p = new URLSearchParams({
      type: tab,
      sort,
      page: String(page),
      page_size: String(PAGE_SIZE),
    });

    if (status) p.set("status", status);
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    if (party) p.set("party", party);

    return p.toString();
  }, [tab, sort, page, status, dateFrom, dateTo, party]);

  const requestKey = `${queryString}#${refreshToken}`;
  const [result, setResult] = useState({
    key: null,
    rows: [],
    pagination: null,
    error: "",
  });

  const loading = result.key !== requestKey;

  useEffect(() => {
    let cancelled = false;

    callApi(`/api/transactions?${queryString}`)
      .then((json) => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            rows: json.data,
            pagination: json.pagination,
            error: "",
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            rows: [],
            pagination: null,
            error: err.message || "Gagal memuat transaksi.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [queryString, requestKey]);

  function handleTabChange(next) {
    setTab(next);
    setStatus("");
    setPage(1);
  }

  function handlePartyInputChange(value) {
    setPartyInput(value);
    setParty(value.trim());
    setPage(1);
  }

  function handleChanged(message) {
    setDetailId(null);
    setFormState(null);
    setFlash(message);
    setRefreshToken((t) => t + 1);
    router.refresh();
  }

  function resetFilters() {
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSort("date_desc");
    setPartyInput("");
    setParty("");
    setPage(1);
  }

  const isAll = readOnly && tab === "all";
  const isIncoming = tab === "incoming";
  const statusList = STATUS_OPTIONS[tab] ?? STATUS_OPTIONS.incoming;
  const pagination = result.pagination;

  const searchPlaceholder = isAll
    ? "Cari supplier, customer, atau tujuan..."
    : isIncoming
    ? "Cari supplier..."
    : "Cari customer atau tujuan...";

  return (
    <div
      className="min-h-screen bg-[#DCE6EF] text-[#30465B] p-2.5 sm:p-5"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="max-w-350 w-full mx-auto flex flex-col md:flex-row items-start gap-3 sm:gap-4 min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar role={role} />

        <div className="flex-1 w-full min-w-0 rounded-[24px] sm:rounded-[28px] bg-white/95 border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.08)] flex flex-col">
          <AdminTopbar
            adminName={userName}
            role={role}
            currentSection="Transaksi"
          />

          <main className="flex-1 min-w-0 px-4 sm:px-7 pt-3 pb-5 sm:pb-7 space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1
                  className="text-[28px] sm:text-[34px] leading-[1.08] font-bold tracking-tight text-[#30465B]"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Transaksi
                </h1>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#8998A5]">
                  {readOnly
                    ? "Pemantauan seluruh transaksi barang masuk dan keluar gudang (read-only)."
                    : "Seluruh transaksi barang masuk dan keluar gudang."}
                </p>
              </div>

              {isStaff && (
                <button
                  type="button"
                  onClick={() =>
                    setFormState({ mode: "create", type: tab })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4356] text-white text-[12px] font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  {isIncoming ? "Tambah Barang Masuk" : "Tambah Barang Keluar"}
                </button>
              )}
            </div>

            {flash && (
              <div
                role="status"
                className="rounded-xl bg-[#EAF6EE] text-[#2F855A] px-4 py-2.5 text-[12px] font-medium flex justify-between gap-3"
              >
                <span>{flash}</span>
                <button
                  type="button"
                  onClick={() => setFlash("")}
                  className="font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 border-b border-[#E8EEF4]">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTabChange(t.key)}
                  className={`px-3.5 sm:px-4 py-2.5 text-[13px] border-b-2 -mb-px whitespace-nowrap cursor-pointer ${
                    tab === t.key
                      ? "border-[#2D4356] font-semibold text-[#30465B]"
                      : "border-transparent text-[#8998A5] hover:text-[#30465B]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="rounded-[20px] bg-[#F8FAFC] border border-[#E8EEF4] p-3 sm:p-3.5 flex flex-wrap items-center gap-2.5">
              <form
                className="relative flex-1 min-w-48 w-full sm:w-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  setParty(partyInput.trim());
                  setPage(1);
                }}
              >
                <Search
                  className="w-4 h-4 text-[#8998A5] pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  strokeWidth={1.8}
                />
                <input
                  type="search"
                  value={partyInput}
                  onChange={(e) => handlePartyInputChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="Cari supplier atau customer"
                  className={`${fieldCls} w-full pl-9`}
                />
              </form>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter status"
                className={`${fieldCls} w-full sm:w-auto`}
              >
                <option value="">Semua status</option>
                {statusList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <label className="text-[11px] text-[#8998A5] flex items-center gap-1.5 w-full sm:w-auto">
                <span className="shrink-0">Dari</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className={`${fieldCls} flex-1 sm:flex-initial`}
                />
              </label>

              <label className="text-[11px] text-[#8998A5] flex items-center gap-1.5 w-full sm:w-auto">
                <span className="shrink-0">Sampai</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className={`${fieldCls} flex-1 sm:flex-initial`}
                />
              </label>

              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                aria-label="Urutkan"
                className={`${fieldCls} w-full sm:w-auto`}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="text-[12px] font-semibold text-[#527DA3] hover:text-[#30465B] cursor-pointer px-2.5 py-1.5"
              >
                Reset
              </button>
            </div>

            <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-[#E8EEF4]">
              <table className="w-full min-w-170 text-left text-[13px]">
                <thead>
                  <tr className="bg-[#F7F9FA] text-[10.5px] uppercase tracking-wider text-[#8998A5]">
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">
                      No. Transaksi
                    </th>
                    {readOnly && (
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">
                        Jenis
                      </th>
                    )}
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">
                      {isAll
                        ? "Supplier / Tujuan"
                        : isIncoming
                        ? "Supplier"
                        : "Customer/Tujuan"}
                    </th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">
                      Produk
                    </th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">
                      Dibuat oleh
                    </th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="px-4 py-8 text-center text-[#8998A5]"
                      >
                        Memuat transaksi...
                      </td>
                    </tr>
                  )}

                  {!loading && result.error && (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="px-4 py-8 text-center text-[#C53030]"
                      >
                        {result.error}
                      </td>
                    </tr>
                  )}

                  {!loading && !result.error && result.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="px-4 py-8 text-center text-[#8998A5]"
                      >
                        Belum ada transaksi yang sesuai.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    result.rows.map((row) => {
                      const rowIsIncoming = row.type === "incoming";
                      const typeMeta = getTypeBadgeMeta(row.type);

                      return (
                        <tr
                          key={row.id}
                          className="border-t border-[#F1F5F9]"
                        >
                          <td className="px-4 py-3 font-semibold text-[#30465B] whitespace-nowrap">
                            {row.transaction_number}
                          </td>

                          {readOnly && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${typeMeta.className}`}
                              >
                                {typeMeta.label}
                              </span>
                            </td>
                          )}

                          <td className="px-4 py-3 text-[#637587] whitespace-nowrap">
                            {formatDateId(row.transaction_date)}
                          </td>

                          <td className="px-4 py-3 text-[#30465B]">
                            {rowIsIncoming
                              ? row.supplier_name || "-"
                              : row.customer_destination || "-"}
                            {rowIsIncoming && row.po_number && (
                              <span className="block text-[11px] text-[#8998A5]">
                                PO: {row.po_number}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-[#637587] whitespace-nowrap">
                            {row.item_count} produk • {row.total_quantity} unit
                          </td>

                          <td className="px-4 py-3 text-[#637587] whitespace-nowrap">
                            {row.created_by_name || "-"}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <TransactionStatusBadge status={row.status} />
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setDetailId(row.id)}
                              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[#527DA3] hover:bg-[#F5F8FB] hover:text-[#30465B] transition-colors cursor-pointer"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#637587]">
                <span>
                  Halaman {pagination.page} dari {pagination.totalPages} •{" "}
                  {pagination.total} transaksi
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Halaman sebelumnya"
                    className="p-2 rounded-xl border border-[#E8EEF4] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Halaman berikutnya"
                    className="p-2 rounded-xl border border-[#E8EEF4] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {detailId && (
        <TransactionDetailModal
          key={detailId}
          transactionId={detailId}
          role={role}
          userId={userId}
          onClose={() => setDetailId(null)}
          onChanged={handleChanged}
          onEdit={
            readOnly
              ? undefined
              : (detail) => {
                  setDetailId(null);
                  setFormState({ mode: "edit", initial: detail });
                }
          }
        />
      )}

      {!readOnly && formState && (
        <TransactionFormModal
          key={
            formState.mode === "edit"
              ? `edit-${formState.initial.id}`
              : `create-${formState.type}`
          }
          mode={formState.mode}
          type={formState.type}
          initial={formState.initial}
          products={products}
          suppliers={suppliers}
          receivedOrders={receivedOrders}
          onClose={() => setFormState(null)}
          onSaved={handleChanged}
        />
      )}
    </div>
  );
}