"use client";

export default function AdminInventoryOverview({
  inventoryOverview = {
    totalProducts: 0,
    normal: 0,
    low: 0,
    severe: 0,
    outOfStock: 0,
  },
}) {
  const total = Math.max(0, Number(inventoryOverview?.totalProducts ?? 0));
  const normal = Math.max(0, Number(inventoryOverview?.normal ?? 0));
  const low = Math.max(0, Number(inventoryOverview?.low ?? 0));
  const severe = Math.max(0, Number(inventoryOverview?.severe ?? 0));
  const outOfStock = Math.max(0, Number(inventoryOverview?.outOfStock ?? 0));

  const sumCategories = normal + low + severe + outOfStock;
  const radius = 36;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    {
      key: "normal",
      label: "Normal",
      count: normal,
      color: "#527DA3",
      labelClass: "text-[#30465B] font-semibold",
    },
    {
      key: "low",
      label: "Low",
      count: low,
      color: "#E99A4A",
      labelClass: "text-[#D48232] font-semibold",
    },
    {
      key: "severe",
      label: "Severe",
      count: severe,
      color: "#D9534F",
      labelClass: "text-[#C94440] font-semibold",
    },
    {
      key: "outOfStock",
      label: "Out of Stock",
      count: outOfStock,
      color: "#8998A5",
      labelClass: "text-[#637587] font-medium",
    },
  ];

  let accumulatedOffset = 0;

  return (
    <section className="rounded-[22px] bg-white border border-[#E8EEF4] p-5 shadow-[0_6px_18px_rgba(48,70,91,0.04)]">
      <div className="mb-4">
        <h2
          className="text-[15px] font-bold text-[#30465B]"
          style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
        >
          Inventory Overview
        </h2>
      </div>

      <div className="flex items-center justify-between gap-5 py-1">
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-28 h-28 -rotate-90"
            aria-label="Distribusi stok produk"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#EEF3F7"
              strokeWidth={strokeWidth}
            />

            {sumCategories > 0 &&
              segments.map((seg) => {
                if (seg.count <= 0) return null;
                const length = (seg.count / sumCategories) * circumference;
                const dashArray = `${length} ${circumference}`;
                const dashOffset = -accumulatedOffset;
                accumulatedOffset += length;

                return (
                  <circle
                    key={seg.key}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span
              className="text-[18px] leading-none font-bold text-[#30465B]"
              style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
            >
              {total.toLocaleString("id-ID")}
            </span>
            <span className="mt-1 text-[10px] text-[#8998A5] leading-none">
              Products
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2 text-[12px]">
          {segments.map((seg) => (
            <div
              key={seg.key}
              className="flex items-center justify-between gap-3"
            >
              <span className={seg.labelClass}>{seg.label}</span>
              <span className="font-bold text-[#30465B] tabular-nums">
                {seg.count.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}