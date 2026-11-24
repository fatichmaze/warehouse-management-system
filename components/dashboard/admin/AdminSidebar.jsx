"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Tags,
  UserCheck,
  ArrowLeftRight,
  ClipboardList,
  ShieldCheck,
  X,
} from "lucide-react";
import { getRoleConfig } from "@/lib/roles";

const SIDEBAR_STORAGE_KEY = "tataloka:sidebar-collapsed";
const TOGGLE_DESKTOP_SIDEBAR_EVENT = "tataloka:toggle-desktop-sidebar";
const OPEN_MOBILE_SIDEBAR_EVENT = "tataloka:open-mobile-sidebar";
const SIDEBAR_PREFERENCE_CHANGE_EVENT = "tataloka:sidebar-preference-change";

function readCollapsedPreference() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeCollapsedPreference(nextCollapsed) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(Boolean(nextCollapsed))
    );
  } catch {}
  window.dispatchEvent(new Event(SIDEBAR_PREFERENCE_CHANGE_EVENT));
}

function subscribeCollapsedPreference(onStoreChange) {
  if (typeof window === "undefined") return () => {};

  function handleStorageEvent(event) {
    if (event.key === null || event.key === SIDEBAR_STORAGE_KEY) {
      onStoreChange();
    }
  }

  function handleLocalPreferenceChange() {
    onStoreChange();
  }

  window.addEventListener("storage", handleStorageEvent);
  window.addEventListener(
    SIDEBAR_PREFERENCE_CHANGE_EVENT,
    handleLocalPreferenceChange
  );

  return () => {
    window.removeEventListener("storage", handleStorageEvent);
    window.removeEventListener(
      SIDEBAR_PREFERENCE_CHANGE_EVENT,
      handleLocalPreferenceChange
    );
  };
}

function getServerCollapsedSnapshot() {
  return false;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const NAV_ICONS = {
  dashboard: LayoutGrid,
  products: Package,
  categories: Tags,
  suppliers: UserCheck,
  transactions: ArrowLeftRight,
  restock: ClipboardList,
};

export default function AdminSidebar({ pendingCount = 0, role }) {
  const pathname = usePathname();
  const roleConfig = getRoleConfig(role);
  const navItems = roleConfig.navItems;

  const isCollapsed = useSyncExternalStore(
    subscribeCollapsedPreference,
    readCollapsedPreference,
    getServerCollapsedSnapshot
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(null);
  const asideRef = useRef(null);
  const closeDrawerButtonRef = useRef(null);

  const safePendingCount = Number.isFinite(Number(pendingCount))
    ? Math.max(0, Number(pendingCount))
    : 0;

  const isDrawerActive = isDesktopViewport === false && mobileOpen;

  const closeMobileDrawer = useCallback((restoreFocus = false) => {
    setMobileOpen(false);
    if (restoreFocus && typeof document !== "undefined") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const hamburgerEl = document.querySelector(
            '[data-sidebar-hamburger="true"]'
          );
          if (hamburgerEl instanceof HTMLElement) {
            hamburgerEl.focus();
          }
        });
      });
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function handleViewportChange(event) {
      const matchesDesktop = event.matches;
      setIsDesktopViewport(matchesDesktop);
      if (matchesDesktop) {
        setMobileOpen(false);
      }
    }

    setIsDesktopViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    function handleDesktopToggle() {
      const nextCollapsed = !readCollapsedPreference();
      writeCollapsedPreference(nextCollapsed);
    }

    function handleMobileOpen() {
      if (window.matchMedia("(min-width: 768px)").matches) return;
      setMobileOpen(true);
    }

    window.addEventListener(TOGGLE_DESKTOP_SIDEBAR_EVENT, handleDesktopToggle);
    window.addEventListener(OPEN_MOBILE_SIDEBAR_EVENT, handleMobileOpen);

    return () => {
      window.removeEventListener(
        TOGGLE_DESKTOP_SIDEBAR_EVENT,
        handleDesktopToggle
      );
      window.removeEventListener(OPEN_MOBILE_SIDEBAR_EVENT, handleMobileOpen);
    };
  }, []);

  useEffect(() => {
    if (!isDrawerActive) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = requestAnimationFrame(() => {
      closeDrawerButtonRef.current?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileDrawer(true);
        return;
      }

      if (event.key === "Tab" && asideRef.current) {
        const focusableElements = Array.from(
          asideRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter((el) => {
          if (!(el instanceof HTMLElement)) return false;
          return el.offsetParent !== null || el.getClientRects().length > 0;
        });

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];
        const activeEl = document.activeElement;

        if (!asideRef.current.contains(activeEl)) {
          event.preventDefault();
          firstEl.focus();
          return;
        }

        if (event.shiftKey && activeEl === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && activeEl === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerActive, closeMobileDrawer]);

  const isHiddenMobileDrawer = isDesktopViewport === false && !mobileOpen;

  return (
    <>
      {isDrawerActive && (
        <div
          aria-hidden="true"
          onClick={() => closeMobileDrawer(true)}
          className="fixed inset-0 z-40 bg-[#193B59]/35 backdrop-blur-[1px] md:hidden"
        />
      )}

      <aside
        ref={asideRef}
        aria-label={roleConfig.navLabel}
        data-mobile-sidebar-open={isDrawerActive ? "true" : "false"}
        aria-hidden={isHiddenMobileDrawer || undefined}
        inert={isHiddenMobileDrawer ? true : undefined}
        className={`fixed inset-y-3 left-3 z-50 w-64 bg-white rounded-[28px] border border-white/90 shadow-[0_14px_36px_rgba(48,70,91,0.14)] flex flex-col justify-between py-6 overflow-y-auto transition-all duration-200 ease-out md:inset-auto md:z-auto md:translate-x-0 md:overflow-visible md:shrink-0 md:shadow-[0_14px_36px_rgba(48,70,91,0.08)] md:sticky md:top-5 md:h-[calc(100vh-2.5rem)] ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-[calc(100%+1.5rem)] pointer-events-none md:pointer-events-auto"
        } ${isCollapsed ? "md:w-19 px-2.5" : "md:w-57 px-3.5"}`}
      >
        <div>
          <div
            className={`mb-7 flex items-center ${
              isCollapsed
                ? "justify-between px-2 md:justify-center md:px-0"
                : "justify-between px-2"
            }`}
          >
            <Link
              href={roleConfig.dashboardHref}
              title={isCollapsed ? "TATALOKA" : undefined}
              onClick={() => {
                if (mobileOpen) setMobileOpen(false);
              }}
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356F9F]/40 rounded-xl"
            >
              {isCollapsed ? (
                <>
                  <Image
                    src="/logo.png"
                    width={188}
                    height={44}
                    alt="TATALOKA - Kelola Gudang, Lebih Tertata."
                    className="h-11 w-auto max-w-44 object-contain md:hidden"
                  />
                  <span className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F8FB] border border-[#E8EEF4] p-1.5">
                    <Image
                      src="/logo-mark.png"
                      width={32}
                      height={30}
                      alt="TATALOKA"
                      className="h-7 w-7 object-contain"
                    />
                  </span>
                </>
              ) : (
                <Image
                  src="/logo.png"
                  width={188}
                  height={44}
                  alt="TATALOKA - Kelola Gudang, Lebih Tertata."
                  className="h-11 w-auto max-w-44 object-contain"
                />
              )}
            </Link>

            <button
              ref={closeDrawerButtonRef}
              type="button"
              onClick={() => closeMobileDrawer(true)}
              aria-label="Tutup menu navigasi"
              className="inline-flex md:hidden h-8 w-8 items-center justify-center rounded-xl text-[#637587] hover:bg-[#F7F9FA] hover:text-[#193B59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356F9F]/40 cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <nav aria-label={roleConfig.navLabel} className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = NAV_ICONS[item.icon] ?? LayoutGrid;
              const isActive =
                pathname === item.href ||
                pathname?.startsWith(`${item.href}/`);
              const hasPendingBadge =
                item.showPendingBadge && safePendingCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    if (mobileOpen) setMobileOpen(false);
                  }}
                  className={`relative flex items-center rounded-xl text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356F9F]/40 ${
                    isCollapsed
                      ? "justify-between px-3.5 py-2.5 md:justify-center md:px-0 md:h-11 md:w-11 md:mx-auto"
                      : "justify-between px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-[#F7EFE3] text-[#30465B] font-semibold"
                      : "text-[#637587] hover:bg-[#F7F9FA] font-medium"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#30465B]" : "text-[#8998A5]"
                      }`}
                      strokeWidth={1.8}
                    />
                    <span className={isCollapsed ? "md:hidden" : ""}>
                      {item.label}
                    </span>
                  </span>

                  {hasPendingBadge && (
                    <>
                      <span
                        className={`min-w-5 h-5 px-1.5 rounded-full bg-[#E99A4A] text-white text-[11px] font-semibold flex items-center justify-center ${
                          isCollapsed ? "md:hidden" : ""
                        }`}
                      >
                        {safePendingCount}
                      </span>
                      {isCollapsed && (
                        <span
                          aria-hidden="true"
                          className="hidden md:block absolute top-2 right-2 h-2 w-2 rounded-full bg-[#E99A4A]"
                        />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6">
          {isCollapsed && (
            <div className="hidden md:flex flex-col items-center rounded-2xl bg-[#2D4356] text-white p-2.5 shadow-[0_8px_20px_rgba(45,67,86,0.14)]">
              <div
                title={roleConfig.sessionTitle}
                className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center"
              >
                <ShieldCheck className="w-4 h-4" strokeWidth={1.9} />
              </div>
            </div>
          )}

          <div
            className={`rounded-2xl bg-[#2D4356] text-white p-4 shadow-[0_8px_20px_rgba(45,67,86,0.14)] ${
              isCollapsed ? "md:hidden" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center mx-auto mb-2.5">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.9} />
            </div>

            <p className="text-[12px] font-bold text-white text-center">
              {roleConfig.sessionTitle}
            </p>

            <p className="text-[11px] text-[#CBD7E2] text-center mt-1 leading-snug">
              {roleConfig.sessionText}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}