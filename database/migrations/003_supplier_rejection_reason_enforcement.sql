-- Migration 003: Enforcement alasan penolakan Supplier
-- AUD-ACC-DB-01

BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS
    users_supplier_rejection_reason_check;

CREATE OR REPLACE FUNCTION enforce_supplier_rejection_reason()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    requires_reason BOOLEAN := FALSE;
BEGIN
    IF NEW.role = 'supplier' AND NEW.status = 'rejected' THEN
        IF TG_OP = 'INSERT' THEN
            requires_reason := TRUE;
        ELSIF TG_OP = 'UPDATE' THEN
            IF OLD.role IS DISTINCT FROM 'supplier'
               OR OLD.status IS DISTINCT FROM 'rejected'
               OR NEW.rejection_reason IS DISTINCT FROM
                  OLD.rejection_reason THEN
                requires_reason := TRUE;
            END IF;
        END IF;

        IF requires_reason
           AND NULLIF(
               BTRIM(NEW.rejection_reason, E' \t\n\r\f\013'),
               ''
           ) IS NULL THEN
            RAISE EXCEPTION
                'Alasan penolakan Supplier wajib diisi dan tidak boleh kosong.'
                USING ERRCODE = '23514',
                      CONSTRAINT =
                      'users_supplier_rejection_reason_check';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_supplier_rejection_reason ON users;

CREATE TRIGGER trg_users_supplier_rejection_reason
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION enforce_supplier_rejection_reason();

COMMIT;