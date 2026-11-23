import { ReceiptText } from "lucide-react";
import {
  formatDateDisplay,
  formatTransactionType,
  getTransactionStatusStyle,
} from "./productDetailsHelpers";

export default function ProductTransactionsSection({
  transactions = [],
  unit = "",
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E8EEF4] bg-white shadow-[0_2px_10px_rgba(48,70,91,0.04)]">
      <div className="flex items-center gap-2.5 border-b border-[#EEF2F6] px-6 py-4">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8EEF4] bg-[#F7F9FA] text-[#527DA3]">
          <ReceiptText className="h-4 w-4" strokeWidth={1.9} />
        </span>

        <div>
          <h2
            className="text-[18px] font-bold text-[#30465B]"
            style={{
              fontFamily: "var(--font-bricolage), sans-serif",
            }}
          >
            5 Transaksi Terakhir
          </h2>

          <p className="text-[11.5px] text-[#8998A5]">
            Riwayat transaksi terbaru yang melibatkan produk ini.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-180 border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E8EEF4] bg-[#F7F9FA] text-[10.5px] font-semibold uppercase tracking-wider text-[#8998A5]">
              <th className="whitespace-nowrap py-3 pl-6 pr-3">
                No. Transaksi
              </th>
              <th className="whitespace-nowrap px-3 py-3">Tipe</th>
              <th className="whitespace-nowrap px-3 py-3">Tanggal</th>
              <th className="whitespace-nowrap px-3 py-3 text-right">
                Quantity
              </th>
              <th className="whitespace-nowrap px-3 py-3">Status</th>
              <th className="whitespace-nowrap py-3 pl-3 pr-6">
                Keterangan / Tujuan
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EEF2F6] text-[12.5px] text-[#30465B]">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-[12px] text-[#8998A5]"
                >
                  Belum ada riwayat transaksi untuk produk ini.
                </td>
              </tr>
            ) : (
              transactions.map((trx, index) => {
                const qty = Number(trx?.quantity ?? 0);
                const trxStatus = trx?.status || "-";

                const detailNote =
                  trx?.customer_destination ||
                  trx?.notes ||
                  trx?.rejection_reason ||
                  "-";

                return (
                  <tr
                    key={
                      trx?.transaction_item_id ??
                      `${trx?.transaction_id ?? "trx"}-${index}`
                    }
                    className="transition-colors hover:bg-[#FAFBFD]"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3 font-semibold text-[#527DA3]">
                      {trx?.transaction_number ||
                        `#${trx?.transaction_id ?? "-"}`}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-[#637587]">
                      {formatTransactionType(trx?.type)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-[#637587]">
                      {formatDateDisplay(
                        trx?.transaction_date || trx?.transaction_created_at
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums">
                      {Number.isFinite(qty) ? qty.toLocaleString("id-ID") : "0"}{" "}
                      <span className="font-normal text-[#637587]">{unit}</span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${getTransactionStatusStyle(
                          trxStatus
                        )}`}
                      >
                        {trxStatus}
                      </span>
                    </td>

                    <td className="max-w-64 truncate py-3 pl-3 pr-6 text-[#637587]">
                      {detailNote}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}