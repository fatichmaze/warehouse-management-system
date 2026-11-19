"use client";

import { Calendar, ChevronDown, ChevronRight, Home } from "lucide-react";

function getInitials(name) {
  if (!name || typeof name !== "string") return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatIndonesianDate(dateInput) {
  const targetDate = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(targetDate.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(targetDate);
}

export default function AdminTopbar({
  adminName = "Admin Tataloka",
  currentSection = "Dashboard",
  dateValue,
}) {
  const formattedDate = formatIndonesianDate(dateValue);
  const initials = getInitials(adminName);

  return (
    <header className="w-full pt-5 pb-2 px-7 bg-transparent flex items-center justify-between gap-4">
      <div className="flex items-center gap-1.5 text-[12px] text-[#8998A5]">
        <Home className="w-3.5 h-3.5 text-[#8998A5]" strokeWidth={1.8} />
        <span>Admin</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#8998A5]" strokeWidth={1.8} />
        <span className="font-semibold text-[#30465B]">{currentSection}</span>
      </div>

      <div className="flex items-center gap-3.5">
        {formattedDate && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E8EEF4] shadow-[0_2px_8px_rgba(48,70,91,0.03)] text-[11.5px] text-[#637587]">
            <Calendar className="w-3.5 h-3.5 text-[#8998A5]" strokeWidth={1.8} />
            <span>{formattedDate}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-full bg-[#DCEAF3] text-[#527DA3] text-[12px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="leading-tight text-left">
            <div className="flex items-center gap-1">
              <p className="text-[12px] font-bold text-[#30465B]">{adminName}</p>
              <ChevronDown className="w-3 h-3 text-[#8998A5]" strokeWidth={1.8} />
            </div>
            <p className="text-[11px] text-[#8998A5]">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}