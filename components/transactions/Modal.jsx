"use client";

import { X } from "lucide-react";

export default function Modal({ title, onClose, children, footer, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2D3C]/45 backdrop-blur-[2px] p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${
          wide ? "max-w-2xl" : "max-w-lg"
        } max-h-[92vh] flex flex-col rounded-3xl bg-white border border-[#E8EEF4] shadow-[0_20px_48px_rgba(48,70,91,0.18)] overflow-hidden my-auto`}
      >
        <div className="px-6 py-4.5 border-b border-[#E8EEF4] flex items-center justify-between gap-4 bg-[#FAFBFD]">
          <h2
            className="text-[20px] leading-tight font-bold text-[#30465B]"
            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-[#8998A5] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-[#E8EEF4] bg-[#FAFBFD] flex flex-wrap justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}