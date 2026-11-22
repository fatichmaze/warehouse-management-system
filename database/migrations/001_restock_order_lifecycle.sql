-- =====================================================================
-- Migration 001: Restock Order lifecycle (Tahap 1)
--
-- Isi:
--   1. Menambah 4 kolom waktu pada restock_orders:
--      confirmed_at, rejected_at, in_transit_at, received_at.
--   2. Membuat partial unique index agar satu PO hanya boleh punya
--      satu Incoming Transaction yang statusnya bukan 'Rejected'.
--   3. Menambah index untuk pencarian restock_orders berdasarkan
--      supplier dan status.
--
-- Sifat migration ini:
--   - Aman dijalankan berulang kali (idempotent).
--   - Seluruhnya satu transaksi: kalau satu langkah gagal, tidak ada
--     perubahan yang tersisa (jalankan dengan ON_ERROR_STOP=1).
--   - Tidak mengubah, menghapus, atau mengisi ulang data yang sudah ada.
--     Baris lama akan punya nilai NULL di keempat kolom baru.
--
-- Jalankan SETELAH backup database. Lihat panduan di laporan Tahap 1.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Kolom waktu per status pada restock_orders
--    Tipe TIMESTAMP (tanpa zona waktu) agar sama dengan created_at.
--    Nullable, tanpa default: nilai diisi oleh service di Tahap 2.
-- ---------------------------------------------------------------------
ALTER TABLE restock_orders
    ADD COLUMN IF NOT EXISTS confirmed_at  TIMESTAMP,
    ADD COLUMN IF NOT EXISTS rejected_at   TIMESTAMP,
    ADD COLUMN IF NOT EXISTS in_transit_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS received_at   TIMESTAMP;

-- ---------------------------------------------------------------------
-- 2. Pemeriksaan data sebelum membuat unique index
--    Jika sudah ada PO yang dipakai lebih dari satu Incoming Transaction
--    non-Rejected, index tidak mungkin dibuat. Daripada gagal dengan
--    pesan teknis, migration dihentikan dengan pesan yang jelas dan
--    TIDAK mengubah data apa pun.
-- ---------------------------------------------------------------------
DO $$
DECLARE
    dup_count INTEGER;
    dup_list  TEXT;
BEGIN
    SELECT COUNT(*),
           string_agg(restock_order_id::text, ', ' ORDER BY restock_order_id)
      INTO dup_count, dup_list
      FROM (
          SELECT restock_order_id
          FROM transactions
          WHERE restock_order_id IS NOT NULL
            AND status <> 'Rejected'
          GROUP BY restock_order_id
          HAVING COUNT(*) > 1
      ) AS duplicates;

    IF dup_count > 0 THEN
        RAISE EXCEPTION
            'Migration dibatalkan: % Restock Order dipakai lebih dari satu Incoming Transaction non-Rejected (restock_order_id: %).',
            dup_count, dup_list
            USING HINT = 'Perbaiki data duplikat tersebut secara manual (mis. tolak/hapus salah satu transaksi), lalu jalankan migration lagi.';
    END IF;
END
$$;

-- ---------------------------------------------------------------------
-- 3. Satu PO = maksimal satu Incoming Transaction yang tidak Rejected
--    Transaksi berstatus 'Rejected' tidak dihitung, sehingga PO yang
--    transaksinya ditolak tetap bisa dibuatkan transaksi baru.
--
--    Predikat sengaja TIDAK memuat "type = 'incoming'". Constraint
--    transactions_restock_check sudah menjamin hanya transaksi incoming
--    yang boleh punya restock_order_id, jadi maknanya sama. Tanpa kondisi
--    type, index ini juga dipakai oleh query yang sudah ada
--    (restock_order_id = X AND status <> 'Rejected') di
--    lib/transaction-service.js dan TransactionsPage.jsx.
-- ---------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_one_active_incoming_per_po
    ON transactions (restock_order_id)
    WHERE restock_order_id IS NOT NULL
      AND status <> 'Rejected';

-- ---------------------------------------------------------------------
-- 4. Index pendukung pencarian restock_orders
--    - (supplier_id, status): supplier melihat PO miliknya per status.
--      Juga melayani pencarian berdasarkan supplier_id saja.
--    - (status): Warehouse Manager/Admin memfilter PO per status.
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_restock_orders_supplier_status
    ON restock_orders (supplier_id, status);

CREATE INDEX IF NOT EXISTS idx_restock_orders_status
    ON restock_orders (status);

COMMIT;
