BEGIN;

-- 1. Kolom untuk menyimpan alasan penolakan Supplier
ALTER TABLE users
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Pastikan alasan wajib untuk penolakan Supplier baru.
-- Data rejected yang sudah ada tetap dipertahankan.
ALTER TABLE users
ADD CONSTRAINT users_supplier_rejection_reason_check
CHECK (
    role <> 'supplier'
    OR status <> 'rejected'
    OR rejection_reason IS NOT NULL
    OR created_at < CURRENT_TIMESTAMP
);
COMMIT;