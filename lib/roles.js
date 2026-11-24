// Konfigurasi role terpusat TATALOKA.

export const ROLES = Object.freeze({
  ADMIN: "admin",
  WAREHOUSE_MANAGER: "warehouse_manager",
  STAFF: "staff",
  SUPPLIER: "supplier",
});

export const DEFAULT_ROLE = ROLES.ADMIN;

export const ROLE_CONFIG = Object.freeze({
  [ROLES.ADMIN]: {
    label: "Admin",
    title: "Administrator",
    defaultName: "Admin Tataloka",
    fallbackInitials: "AD",
    dashboardHref: "/admin/dashboard",
    navLabel: "Navigasi Admin",
    sessionTitle: "Sesi Admin Aktif",
    sessionText: "Anda masuk sebagai administrator sistem.",
    navItems: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
      { label: "Products", href: "/admin/products", icon: "products" },
      { label: "Categories", href: "/admin/categories", icon: "categories" },
      {
        label: "Transactions",
        href: "/admin/transactions",
        icon: "transactions",
      },
      {
        label: "Supplier Verification",
        href: "/admin/suppliers",
        icon: "suppliers",
        showPendingBadge: true,
      },
    ],
  },

  [ROLES.WAREHOUSE_MANAGER]: {
    label: "Warehouse Manager",
    title: "Warehouse Manager",
    defaultName: "Warehouse Manager",
    fallbackInitials: "WM",
    dashboardHref: "/warehouse-manager/dashboard",
    navLabel: "Navigasi Warehouse Manager",
    sessionTitle: "Sesi Manager Aktif",
    sessionText: "Anda masuk sebagai manajer gudang.",
    navItems: [
      { label: "Dashboard", href: "/warehouse-manager/dashboard", icon: "dashboard" },
      { label: "Products", href: "/admin/products", icon: "products" },
      { label: "Categories", href: "/admin/categories", icon: "categories" },
      {
        label: "Transactions",
        href: "/warehouse-manager/transactions",
        icon: "transactions",
      },
      {
        label: "Restock Orders",
        href: "/warehouse-manager/restock-orders",
        icon: "restock",
      },
    ],
  },

  [ROLES.STAFF]: {
    label: "Staff",
    title: "Staff Gudang",
    defaultName: "Staff Tataloka",
    fallbackInitials: "ST",
    dashboardHref: "/staff/dashboard",
    navLabel: "Navigasi Staff",
    sessionTitle: "Sesi Staff Aktif",
    sessionText: "Anda masuk sebagai staff gudang.",
    navItems: [
      { label: "Dashboard", href: "/staff/dashboard", icon: "dashboard" },
      { label: "Products", href: "/staff/products", icon: "products" },
      {
        label: "Transactions",
        href: "/staff/transactions",
        icon: "transactions",
      },
    ],
  },

  [ROLES.SUPPLIER]: {
    label: "Supplier",
    title: "Supplier",
    defaultName: "Supplier Tataloka",
    fallbackInitials: "SP",
    dashboardHref: "/supplier/dashboard",
    navLabel: "Navigasi Supplier",
    sessionTitle: "Sesi Supplier Aktif",
    sessionText: "Anda masuk sebagai supplier terverifikasi.",
    navItems: [
      { label: "Dashboard", href: "/supplier/dashboard", icon: "dashboard" },
      {
        label: "Restock Orders",
        href: "/supplier/restock-orders",
        icon: "restock",
      },
    ],
  },
});

export function normalizeRole(role) {
  const value = String(role ?? "").trim().toLowerCase();
  return Object.hasOwn(ROLE_CONFIG, value) ? value : null;
}

export function getRoleConfig(role) {
  const normalized = normalizeRole(role);
  if (normalized) return ROLE_CONFIG[normalized];

  const isMissing = String(role ?? "").trim() === "";
  return ROLE_CONFIG[isMissing ? DEFAULT_ROLE : ROLES.STAFF];
}
