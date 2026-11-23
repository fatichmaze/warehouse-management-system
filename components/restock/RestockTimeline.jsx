"use client";

import { Check } from "lucide-react";

function formatDateTime(value) {
  if (!value) return "Belum dilakukan";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak valid";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function RestockTimeline({ order }) {
  const rejected = order.status === "Rejected";

  const steps = [
    {
      title: "PO Dibuat",
      description: "Warehouse Manager membuat pesanan",
      timestamp: order.created_at,
      completed: Boolean(order.created_at),
    },
    {
      title: "Dikonfirmasi Supplier",
      description: "Supplier mengonfirmasi pesanan",
      timestamp: order.confirmed_at,
      completed: Boolean(order.confirmed_at),
    },
    {
      title: "Dalam Perjalanan",
      description: "Supplier mulai mengirimkan pesanan",
      timestamp: order.in_transit_at,
      completed: Boolean(order.in_transit_at),
    },
    {
      title: "Diterima",
      description: "Pesanan telah diterima warehouse",
      timestamp: order.received_at,
      completed: Boolean(order.received_at),
    },
  ];

  return (
    <section className="mt-5 rounded-2xl border border-[#E8EEF4] bg-white p-4 sm:p-5">
      <div className="mb-5">
        <h3 className="text-[14px] font-bold text-[#30465B]">
          Progress Restock Order
        </h3>
        <p className="mt-1 text-[11px] text-[#8998A5]">
          Riwayat tahapan dan waktu perubahan status pesanan.
        </p>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const lastStep = index === steps.length - 1;

          return (
            <div key={step.title} className="relative flex gap-3">
              <div className="flex w-7 shrink-0 flex-col items-center">
                <div
                  className={`z-10 flex h-7 w-7 items-center justify-center rounded-full border ${
                    step.completed
                      ? "border-[#C6E7D0] bg-[#EAF6EE] text-[#2F855A]"
                      : "border-[#E8EEF4] bg-[#F7F9FA] text-[#8998A5]"
                  }`}
                >
                  {step.completed ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <span className="text-[10px] font-semibold">
                      {index + 1}
                    </span>
                  )}
                </div>

                {!lastStep && (
                  <div
                    className={`min-h-12 w-px ${
                      step.completed
                        ? "bg-[#C6E7D0]"
                        : "bg-[#E8EEF4]"
                    }`}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-5">
                <p
                  className={`text-[12px] font-semibold ${
                    step.completed
                      ? "text-[#30465B]"
                      : "text-[#8998A5]"
                  }`}
                >
                  {step.title}
                </p>

                <p className="mt-0.5 text-[10px] text-[#8998A5]">
                  {step.description}
                </p>

                <p className="mt-1 text-[10px] font-medium text-[#527DA3]">
                  {formatDateTime(step.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {rejected && (
        <div className="mt-1 rounded-xl border border-[#F5C2C7] bg-[#FDECEC] p-3">
          <p className="text-[12px] font-semibold text-[#C53030]">
            Pesanan Ditolak
          </p>

          <p className="mt-1 text-[10px] text-[#9B2C2C]">
            {formatDateTime(order.rejected_at)}
          </p>

          {order.status_notes && (
            <p className="mt-2 whitespace-pre-wrap text-[11px] text-[#9B2C2C]">
              Alasan: {order.status_notes}
            </p>
          )}
        </div>
      )}
    </section>
  );
}