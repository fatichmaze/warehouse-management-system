<div align="center">

<img src="public/logo.png" alt="TATALOKA Logo" width="280">

# TATALOKA — Warehouse Management System

**Kelola Gudang, Lebih Tertata.**

Satu sistem untuk mengelola inventaris, memantau persediaan, mencatat transaksi, dan menghubungkan operasional gudang dengan Supplier.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-111111?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JOSE](https://img.shields.io/badge/Auth-JOSE_JWT-2B2D42?style=flat-square)](https://github.com/panva/jose)

[About](#about-tataloka) · [At a Glance](#tataloka-at-a-glance) · [Features](#what-tataloka-can-do) · [Workflow](#how-it-works) · [Roles](#who-uses-tataloka) · [Tech Stack](#technology-behind-tataloka) · [Database](#database-structure) · [Getting Started](#getting-started) · [Demo](#demo-environment)

**INVENTORY MANAGEMENT · OPERATIONAL CONTROL · SUPPLIER COORDINATION**

</div>

---

## About TATALOKA

TATALOKA adalah aplikasi Warehouse Management System berbasis web yang dirancang untuk membantu pengelolaan operasional gudang secara terstruktur.

Mulai dari pencatatan produk, pemantauan stok, pengelolaan pemesanan ulang, hingga transaksi barang masuk dan keluar, seluruh proses dikelola melalui satu sistem dengan pembagian hak akses berdasarkan peran pengguna.

| Aspek | Fokus Utama |
| :--- | :--- |
| **Our Purpose** | Membantu operasional gudang menjadi lebih terorganisasi melalui pencatatan persediaan dan alur transaksi yang terstruktur. |
| **Our Approach** | Menghubungkan Admin, Manager, Staff, dan Supplier dalam satu alur kerja dengan kontrol akses dan perubahan stok yang terjaga. |

---

## TATALOKA at a Glance

Ringkasan data pada lingkungan demonstrasi:

| Metrik | Jumlah | Keterangan |
| :--- | :---: | :--- |
| **Users** | **7** | 4 roles |
| **Products** | **24** | 4 categories |
| **Restock Orders** | **8** | Supplier workflow |
| **Transactions** | **10** | Incoming & Outgoing |

---

## What TATALOKA Can Do

Pengelolaan gudang dibagi menjadi beberapa modul utama.

### Inventory Management

Mengelola informasi produk dan persediaan.

* Product management
* Category management
* Unique SKU
* Automatic stock status
* Low-stock monitoring

### Restock Management

Mengelola pemesanan ulang kepada Supplier.

* Create Restock Order
* Supplier confirmation
* Rejection with reason
* Shipment status tracking (`In Transit`)
* Receiving confirmation

### Incoming Transactions

Mengelola pencatatan barang masuk.

* Create incoming transaction
* Link with received PO
* Manager approval
* Automatic stock increase

### Outgoing Transactions

Mengelola pencatatan barang keluar.

* Create outgoing transaction
* Manager approval or rejection
* Shipment status update
* Automatic stock decrease

---

## How It Works

TATALOKA mengatur proses gudang melalui dua alur transaksi utama.

### 01. Restock Order Flow

**MANAGER → SUPPLIER → WAREHOUSE**

```mermaid
flowchart TD
    A["Manager creates PO"] --> B["Pending"]
    B --> C{"Supplier decision"}
    C -->|Confirm| D["Confirmed"]
    C -->|Reject + reason| E["Rejected"]
    D --> F["In Transit"]
    F --> G["Manager: Received"]
    G --> H["Staff creates Incoming"]
    H --> I["Manager approves"]
    I --> J["Stock increases"]
```

> **Important:** Restock Order berstatus `Received` belum menambah stok. Stok baru bertambah setelah transaksi Incoming disetujui oleh Manager.

### 02. Outgoing Transaction Flow

**STAFF → MANAGER → WAREHOUSE**

```mermaid
flowchart TD
    A["Staff creates Outgoing"] --> B["Pending"]
    B --> C{"Manager decision"}
    C -->|Reject + reason| D["Rejected"]
    C -->|Approve| E["Approved"]
    E --> F["Staff updates status"]
    F --> G["Shipped"]
    G --> H["Stock decreases"]
```

> **Important:** Transaksi yang berstatus `Approved` belum mengurangi stok. Pengurangan stok dilakukan ketika Staff memperbarui status menjadi `Shipped`.

---

## Inventory Status

Status stok ditentukan secara otomatis berdasarkan jumlah persediaan dan batas stok produk.

| Status | Stock Condition | Description |
| :--- | :--- | :--- |
| 🟢 **Normal** | `Stock > Low Stock` | Persediaan berada pada kondisi normal. |
| 🟡 **Low** | `Min Stock < Stock <= Low Stock` | Persediaan mulai rendah. |
| 🔴 **Severe** | `0 < Stock <= Min Stock` | Persediaan berada di bawah batas minimum. |
| ⚫ **Out of Stock** | `Stock = 0` | Produk tidak memiliki persediaan. |

---

## Who Uses TATALOKA?

Empat peran pengguna memiliki tanggung jawab berbeda dalam operasional gudang.

| Role | Responsibilities |
| :--- | :--- |
| ⚙️ **ADMIN** | User management, Supplier verification, product and category management. |
| 📊 **MANAGER** | Restock Orders, product management, and transaction approval. |
| 📋 **STAFF** | Incoming and outgoing transaction operations. |
| 🏢 **SUPPLIER** | Mengakses Restock Order miliknya sendiri, mengonfirmasi atau menolak Restock Order dengan alasan penolakan, serta memperbarui status pengiriman menjadi `In Transit`. |

---

## Technology Behind TATALOKA

Teknologi yang digunakan dalam pengembangan aplikasi:

| Frontend | Backend & Database |
| :--- | :--- |
| Next.js 16.4.6 | Next.js App Router |
| React 19.3.0 | PostgreSQL |
| JavaScript | node-postgres (`pg`) |
| Tailwind CSS 4.3.3 | JOSE (JWT) |
| Lucide React | `bcryptjs` |

---

## Database Structure

TATALOKA menggunakan PostgreSQL dengan tujuh tabel utama.

```text
DATABASE: tataloka_db

users
  └── Pengguna dan Supplier

categories
  └── Kategori produk

products
  └── Data produk dan persediaan

restock_orders
  └── Data pemesanan ulang

restock_items
  └── Detail produk dalam PO

transactions
  └── Transaksi barang masuk dan keluar

transaction_items
  └── Detail barang dalam transaksi
```

---

## Getting Started

Ingin menjalankan TATALOKA di perangkat lokal? Ikuti langkah berikut.

### Prerequisites

* Node.js dan `npm`
* PostgreSQL
* Git

### 1. Clone Repository

```bash
git clone [https://github.com/fatichmaze/warehouse-management-system.git](https://github.com/fatichmaze/warehouse-management-system.git)
cd warehouse-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Database

Buat database PostgreSQL:

```sql
CREATE DATABASE tataloka_db;
```

### 4. Configure Environment

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Pada Windows Command Prompt (`cmd`), gunakan:

```cmd
copy .env.example .env.local
```

Sesuaikan konfigurasi berikut di `.env.local`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tataloka_db
SESSION_SECRET=replace_with_a_long_random_secret
```

Ganti `your_password` dengan password PostgreSQL milikmu dan gunakan secret acak yang panjang (`SESSION_SECRET`). Pastikan `DATABASE_URL` mengarah ke database `tataloka_db` dengan kredensial PostgreSQL yang valid.

### 5. Setup Database Schema

Urutan berikut merupakan panduan untuk setup database baru (`tataloka_db`). Jalankan file SQL berikut secara berurutan melalui `pgAdmin` atau PostgreSQL client:

| Order | File |
| :---: | :--- |
| 01 | `database/schema.sql` |
| 02 | `database/migrations/001_restock_order_lifecycle.sql` |
| 03 | `database/migrations/002_supplier_rejection_reason.sql` |

Jalankan setiap migration pada database baru yang sedang disiapkan; jangan menjalankan ulang migration pada database yang sudah selesai disiapkan.

### 6. Insert Demo Data

Jalankan:

```sql
\i database/seed.sql
```

Atau melalui terminal `psql`:

```bash
psql "$DATABASE_URL" -f database/seed.sql
```

Perintah `\i database/seed.sql` merupakan meta-command klien `psql`, bukan perintah SQL biasa untuk Query Tool `pgAdmin`.

Untuk pengguna **Windows**:
* Jalankan perintah dari root folder proyek menggunakan **Command Prompt** atau **PowerShell**, dengan folder `bin` PostgreSQL sudah tersedia di `PATH` atau dengan memanggil path lengkap ke `psql.exe`.

```cmd
psql -U postgres -d tataloka_db -f database\seed.sql
```

Atau dari dalam sesi interaktif `psql` setelah terhubung ke `tataloka_db`:

```text
\i database/seed.sql
```

> **Note:** Seed ditujukan untuk database demo `tataloka_db` yang masih kosong. Jangan menjalankan seed pada database yang sudah berisi data.

### 7. Start Application

```bash
npm run dev
```

Buka aplikasi:

`http://localhost:3000`

---

## Demo Environment

TATALOKA menyediakan tujuh akun untuk menguji aplikasi berdasarkan masing-masing peran.

<details>
<summary><strong>View Demo Credentials</strong></summary>

| Role | Email | Password |
| :--- | :--- | :--- |
| Admin | `admin@tataloka.demo` | `TatalokaAdmin26!` |
| Manager | `manager@tataloka.demo` | `TatalokaManager26!` |
| Staff | `staff@tataloka.demo` | `TatalokaStaff26!` |
| Supplier | `supplier@tataloka.demo` | `TatalokaSupplier26!` |
| Supplier | `sumber@tataloka.demo` | `TatalokaSumber26!` |
| Supplier | `bersih@tataloka.demo` | `TatalokaBersih26!` |
| Supplier | `sentosa@tataloka.demo` | `TatalokaSentosa26!` |

</details>

> **Disclaimer:** Akun demo hanya digunakan untuk demonstrasi dan pengujian lokal. Jangan menggunakan kredensial tersebut pada lingkungan produksi.

---

## Available Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat production build |
| `npm run start` | Menjalankan production server |
| `npm run lint` | Menjalankan pemeriksaan kode menggunakan ESLint |

---

## Project Structure

```text
warehouse-management-system/
│
├── app/                  # Pages and API routes
├── components/           # Reusable UI components
├── database/             # Schema, migrations, and seed
│   └── migrations/
├── lib/                  # Database, auth, and services
├── public/               # Static assets and brand logo
├── scripts/              # Supporting scripts
│
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

<div align="center">

<img src="public/logo-mark.png" alt="TATALOKA Brand Mark" width="72">

### TATALOKA

**Kelola Gudang, Lebih Tertata.**

Organized Inventory. Better Operations.

Individual Project 6
Praktikum Pemrograman Web 2026

**Built with Next.js · PostgreSQL · Tailwind CSS**

</div>