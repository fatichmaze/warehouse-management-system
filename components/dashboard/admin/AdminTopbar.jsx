"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
} from "lucide-react";
import { getRoleConfig } from "@/lib/roles";

const TOGGLE_DESKTOP_SIDEBAR_EVENT = "tataloka:toggle-desktop-sidebar";
const OPEN_MOBILE_SIDEBAR_EVENT = "tataloka:open-mobile-sidebar";

function emptySubscribe() {
  return () => {};
}

function getClientFormattedDate() {
  return formatIndonesianDate(new Date());
}

function getServerFormattedDate() {
  return "";
}

function getInitials(name, fallback = "AD") {
  if (!name || typeof name !== "string") return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatIndonesianDate(dateInput) {
  if (!dateInput) return "";
  const targetDate = new Date(dateInput);
  if (Number.isNaN(targetDate.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(targetDate);
}

export default function AdminTopbar({
  adminName,
  currentSection = "Dashboard",
  dateValue,
  role,
}) {
  const router = useRouter();
  const roleConfig = getRoleConfig(role);
  const displayName = adminName || roleConfig.defaultName;
  const explicitDate = formatIndonesianDate(dateValue);
  const syncedDate = useSyncExternalStore(
    emptySubscribe,
    getClientFormattedDate,
    getServerFormattedDate
  );
  const formattedDate = dateValue ? explicitDate : syncedDate;
  const initials = getInitials(displayName, roleConfig.fallbackInitials);

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        const openDrawer = document.querySelector(
          '[data-mobile-sidebar-open="true"]'
        );
        if (event.defaultPrevented || openDrawer) return;

        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function handleHamburgerClick() {
    if (typeof window === "undefined") return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop) {
      setMenuOpen(false);
    }
    const eventName = isDesktop
      ? TOGGLE_DESKTOP_SIDEBAR_EVENT
      : OPEN_MOBILE_SIDEBAR_EVENT;
    window.dispatchEvent(new Event(eventName));
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Gagal logout.");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout gagal:", error);
      setLoggingOut(false);
    }
  }

  return (
    <header className="w-full pt-5 pb-2 px-4 sm:px-7 bg-transparent flex items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          data-sidebar-hamburger="true"
          onClick={handleHamburgerClick}
          aria-label="Buka atau ciutkan menu navigasi"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E8EEF4] bg-white text-[#30465B] shadow-[0_2px_8px_rgba(48,70,91,0.03)] transition-colors hover:bg-[#F7F9FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356F9F]/40 cursor-pointer"
        >
          <Menu className="w-4 h-4" strokeWidth={2} />
        </button>

        <div className="flex items-center gap-1.5 text-[12px] text-[#8998A5] min-w-0 truncate">
          <Home className="w-3.5 h-3.5 text-[#8998A5] shrink-0" strokeWidth={1.8} />
          <span className="truncate">{roleConfig.label}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#8998A5] shrink-0" strokeWidth={1.8} />
          <span className="font-semibold text-[#30465B] truncate">
            {currentSection}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3.5 shrink-0">
        {formattedDate && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E8EEF4] shadow-[0_2px_8px_rgba(48,70,91,0.03)] text-[11.5px] text-[#637587]">
            <Calendar className="w-3.5 h-3.5 text-[#8998A5]" strokeWidth={1.8} />
            <span>{formattedDate}</span>
          </div>
        )}

        <div ref={containerRef} className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="user-account-dropdown"
            aria-label="Menu akun pengguna"
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F7F9FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356F9F]/40 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#DCEAF3] text-[#527DA3] text-[12px] font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block leading-tight text-left">
              <p className="text-[13px] font-semibold text-[#193B59]">
                {displayName}
              </p>
              <p className="text-[12px] text-[#66788A]">{roleConfig.title}</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#66788A] transition-transform duration-200 shrink-0 ${
                menuOpen ? "rotate-180" : ""
              }`}
              strokeWidth={1.9}
            />
          </button>

          {menuOpen && (
            <div
              id="user-account-dropdown"
              role="region"
              aria-label="Informasi dan aksi akun"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-2xl border border-[#E8EEF4] bg-white p-1.5 shadow-[0_12px_32px_rgba(25,59,89,0.12)]"
            >
              <div className="px-3 py-2">
                <p className="truncate text-[13px] font-semibold text-[#193B59]">
                  {displayName}
                </p>
                <p className="truncate text-[12px] text-[#66788A]">
                  {roleConfig.title}
                </p>
              </div>

              <div className="my-1 border-t border-[#E8EEF4]" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-[#193B59] transition-colors hover:bg-[#FDECEC] hover:text-[#C53030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C53030]/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.9} />
                <span>{loggingOut ? "Keluar..." : "Logout"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}