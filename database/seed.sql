BEGIN;

-- =========================================================
-- TATALOKA SHOWCASE SEED
-- Target database: tataloka_db
-- Hanya untuk database baru yang masih kosong.
-- Tidak menghapus atau mengubah database lain.
-- =========================================================

DO $$
BEGIN
    IF current_database() <> 'tataloka_db' THEN
        RAISE EXCEPTION
            'Seed dibatalkan: database aktif adalah %, bukan tataloka_db.',
            current_database();
    END IF;

    IF EXISTS (SELECT 1 FROM users)
       OR EXISTS (SELECT 1 FROM categories)
       OR EXISTS (SELECT 1 FROM products)
       OR EXISTS (SELECT 1 FROM restock_orders)
       OR EXISTS (SELECT 1 FROM restock_order_items)
       OR EXISTS (SELECT 1 FROM transactions)
       OR EXISTS (SELECT 1 FROM transaction_items) THEN
        RAISE EXCEPTION
            'Seed dibatalkan: ditemukan data pada salah satu tabel. Pastikan database masih kosong.';
    END IF;
END $$;

-- =========================================================
-- 1. USERS: 3 INTERNAL + 4 SUPPLIERS
-- =========================================================

INSERT INTO users
    (name, email, password, role, status, company_name, phone)
VALUES
(
    'Administrator TATALOKA',
    'admin@tataloka.demo',
    '$2b$10$c4gvJhJTQpnB.rOxJrP.ROoDxxUrIyQ5eSiN4LDGX9sEvSQjZZH0q',
    'admin', 'approved', NULL, '081200000001'
),
(
    'Manager Gudang',
    'manager@tataloka.demo',
    '$2b$10$YwxASYRiKYUSweA6oP1.Buwcc58YPspiDlnhv9tt/lAi2iseAIOIy',
    'warehouse_manager', 'approved', NULL, '081200000002'
),
(
    'Staff Gudang',
    'staff@tataloka.demo',
    '$2b$10$I1z5zbZ9PvdqjzxpFFo0TekQVejGFb4aqcQBFxd8ZbXt0I/z7jZ3e',
    'staff', 'approved', NULL, '081200000003'
),
(
    'Mitra Logistik',
    'supplier@tataloka.demo',
    '$2b$10$f03KzSxoivjZR5xNx/O.be/6LfmqIMTF6rw.1o4mLkm4k4ScHMp/O',
    'supplier', 'approved', 'PT Mitra Logistik', '081300000001'
),
(
    'Sumber Perkasa',
    'sumber@tataloka.demo',
    '$2b$10$7BT4z9VrtkgmlNWfutrLZeQLus64qf9EicobhvoEdpqQVNsdIWWwG',
    'supplier', 'approved', 'CV Sumber Perkasa', '081300000002'
),
(
    'Bersih Jaya',
    'bersih@tataloka.demo',
    '$2b$10$C1OBWH9gAgOczXw7RMStWetH3VAJc3ypumTFkbob6TzL0Jy3bFGv2',
    'supplier', 'approved', 'CV Bersih Jaya', '081300000003'
),
(
    'Sentosa Packaging',
    'sentosa@tataloka.demo',
    '$2b$10$2GJ2LVjMSwhIeXvTfY8Np.jUbjGxX1XLzo18W2xk3iGcAKXmcWNpO',
    'supplier', 'approved', 'PT Sentosa Packaging', '081300000004'
);

-- =========================================================
-- 2. CATEGORIES
-- =========================================================

INSERT INTO categories (name, description)
VALUES
(
    'Penyimpanan & Material Handling',
    'Peralatan penyimpanan, penataan, dan pemindahan barang di gudang.'
),
(
    'Administrasi & ATK',
    'Perlengkapan administrasi dan kebutuhan operasional kantor.'
),
(
    'Kebersihan & Keselamatan Kerja',
    'Perlengkapan kebersihan dan perlindungan kerja di area gudang.'
),
(
    'Pengemasan & Pengiriman',
    'Material pengemasan dan perlengkapan persiapan pengiriman barang.'
);

-- =========================================================
-- 3. PRODUCTS: 24 PRODUK
-- Stok di bawah merupakan stok pembukaan.
-- Stok akhir dihitung dari transaksi Approved/Shipped.
-- =========================================================

INSERT INTO products
    (sku, name, category_id, description,
     purchase_price, selling_price, min_stock, low_stock,
     current_stock, unit, rack_location)
VALUES
-- PENYIMPANAN & MATERIAL HANDLING
(
    'TL-GDG-001', 'Rak Penyimpanan Besi',
    (SELECT id FROM categories WHERE name = 'Penyimpanan & Material Handling'),
    'Rak besi untuk penyimpanan barang operasional gudang.',
    450000, 575000, 5, 10, 25, 'Unit', 'A-01'
),
(
    'TL-GDG-002', 'Kotak Organizer Plastik',
    (SELECT id FROM categories WHERE name = 'Penyimpanan & Material Handling'),
    'Kotak plastik untuk mengelompokkan barang kecil.',
    28000, 40000, 5, 10, 28, 'Pcs', 'A-02'
),
(
    'TL-GDG-003', 'Troli Barang Lipat',
    (SELECT id FROM categories WHERE name = 'Penyimpanan & Material Handling'),
    'Troli lipat untuk memindahkan barang di area gudang.',
    325000, 410000, 5, 10, 8, 'Unit', 'A-03'
),
(
    'TL-GDG-004', 'Pallet Plastik',
    (SELECT id FROM categories WHERE name = 'Penyimpanan & Material Handling'),
    'Pallet plastik untuk menopang dan memindahkan muatan.',
    185000, 235000, 5, 10, 3, 'Unit', 'A-04'
),
(
    'TL-GDG-005', 'Kontainer Penyimpanan',
    (SELECT id FROM categories WHERE name = 'Penyimpanan & Material Handling'),
    'Kontainer serbaguna untuk penyimpanan barang.',
    75000, 98000, 5, 10, 18, 'Unit', 'A-05'
),
(
    'TL-GDG-006', 'Keranjang Barang Industri',
    (SELECT id FROM categories WHERE name = 'Penyimpanan & Material Handling'),
    'Keranjang kuat untuk pengelompokan barang gudang.',
    42000, 58000, 5, 10, 0, 'Pcs', 'A-06'
),

-- ADMINISTRASI & ATK
(
    'TL-KTR-001', 'Stapler Heavy Duty',
    (SELECT id FROM categories WHERE name = 'Administrasi & ATK'),
    'Stapler kapasitas besar untuk kebutuhan administrasi.',
    68000, 95000, 5, 10, 20, 'Unit', 'B-01'
),
(
    'TL-KTR-002', 'Papan Tulis Magnetik',
    (SELECT id FROM categories WHERE name = 'Administrasi & ATK'),
    'Papan tulis untuk pencatatan informasi operasional.',
    185000, 245000, 5, 10, 8, 'Unit', 'B-02'
),
(
    'TL-KTR-003', 'Map Arsip Tebal',
    (SELECT id FROM categories WHERE name = 'Administrasi & ATK'),
    'Map tebal untuk penyimpanan dokumen.',
    12000, 18000, 5, 10, 15, 'Pcs', 'B-03'
),
(
    'TL-KTR-004', 'Kertas A4',
    (SELECT id FROM categories WHERE name = 'Administrasi & ATK'),
    'Kertas A4 untuk kebutuhan pencetakan dokumen.',
    48000, 58000, 5, 10, 15, 'Rim', 'B-04'
),
(
    'TL-KTR-005', 'Pulpen Hitam',
    (SELECT id FROM categories WHERE name = 'Administrasi & ATK'),
    'Pulpen tinta hitam untuk pencatatan operasional.',
    2500, 4000, 5, 10, 0, 'Pcs', 'B-05'
),
(
    'TL-KTR-006', 'Ordner Arsip',
    (SELECT id FROM categories WHERE name = 'Administrasi & ATK'),
    'Ordner untuk penyimpanan dokumen dan arsip.',
    18000, 26000, 5, 10, 0, 'Pcs', 'B-06'
),

-- KEBERSIHAN & KESELAMATAN KERJA
(
    'TL-KBR-001', 'Cairan Pembersih Lantai',
    (SELECT id FROM categories WHERE name = 'Kebersihan & Keselamatan Kerja'),
    'Cairan pembersih untuk pemeliharaan kebersihan lantai.',
    22000, 30000, 5, 10, 23, 'Botol', 'C-01'
),
(
    'TL-KBR-002', 'Sapu Industri',
    (SELECT id FROM categories WHERE name = 'Kebersihan & Keselamatan Kerja'),
    'Sapu untuk membersihkan area operasional gudang.',
    35000, 48000, 5, 10, 16, 'Pcs', 'C-02'
),
(
    'TL-KBR-003', 'Tempat Sampah 50 Liter',
    (SELECT id FROM categories WHERE name = 'Kebersihan & Keselamatan Kerja'),
    'Tempat sampah kapasitas 50 liter.',
    95000, 125000, 5, 10, 9, 'Unit', 'C-03'
),
(
    'TL-KBR-004', 'Alat Pel Lantai',
    (SELECT id FROM categories WHERE name = 'Kebersihan & Keselamatan Kerja'),
    'Alat pel untuk pemeliharaan kebersihan lantai.',
    28000, 39000, 5, 10, 4, 'Pcs', 'C-04'
),
(
    'TL-KBR-005', 'Sarung Tangan Kerja',
    (SELECT id FROM categories WHERE name = 'Kebersihan & Keselamatan Kerja'),
    'Sarung tangan untuk perlindungan saat bekerja.',
    15000, 22000, 5, 10, 14, 'Pasang', 'C-05'
),
(
    'TL-KBR-006', 'Sikat Lantai',
    (SELECT id FROM categories WHERE name = 'Kebersihan & Keselamatan Kerja'),
    'Sikat untuk membersihkan permukaan lantai.',
    18000, 26000, 5, 10, 2, 'Pcs', 'C-06'
),

-- PENGEMASAN & PENGIRIMAN
(
    'TL-PKG-001', 'Lakban Bening 48 mm',
    (SELECT id FROM categories WHERE name = 'Pengemasan & Pengiriman'),
    'Lakban bening untuk penyegelan kardus.',
    9500, 14000, 5, 10, 13, 'Roll', 'D-01'
),
(
    'TL-PKG-002', 'Bubble Wrap 50 cm',
    (SELECT id FROM categories WHERE name = 'Pengemasan & Pengiriman'),
    'Material pelindung untuk pengemasan barang.',
    28000, 39000, 5, 10, 12, 'Roll', 'D-02'
),
(
    'TL-PKG-003', 'Kardus Packing Sedang',
    (SELECT id FROM categories WHERE name = 'Pengemasan & Pengiriman'),
    'Kardus ukuran sedang untuk pengemasan barang.',
    6500, 9500, 5, 10, 8, 'Pcs', 'D-03'
),
(
    'TL-PKG-004', 'Stretch Film',
    (SELECT id FROM categories WHERE name = 'Pengemasan & Pengiriman'),
    'Film plastik elastis untuk membungkus muatan.',
    38000, 52000, 5, 10, 17, 'Roll', 'D-04'
),
(
    'TL-PKG-005', 'Plastik Packing',
    (SELECT id FROM categories WHERE name = 'Pengemasan & Pengiriman'),
    'Plastik untuk pengemasan barang operasional.',
    18000, 26000, 5, 10, 6, 'Pack', 'D-05'
),
(
    'TL-PKG-006', 'Lakban Fragile',
    (SELECT id FROM categories WHERE name = 'Pengemasan & Pengiriman'),
    'Lakban penanda paket yang membutuhkan penanganan hati-hati.',
    12000, 18000, 5, 10, 1, 'Roll', 'D-06'
);

-- =========================================================
-- 4. RESTOCK ORDERS: 8 PO
-- =========================================================

INSERT INTO restock_orders
    (po_number, supplier_id, created_by, order_date,
     expected_delivery_date, notes, status, status_notes,
     created_at, confirmed_at, rejected_at, in_transit_at, received_at)
VALUES
(
    'PO-TL-2026-001',
    (SELECT id FROM users WHERE email = 'supplier@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo'),
    '2026-11-17', '2026-11-21',
    'Pengadaan rak penyimpanan untuk area gudang.',
    'Received', NULL,
    '2026-11-17 08:00:00', '2026-11-17 10:00:00',
    NULL, '2026-11-19 09:00:00', '2026-11-21 14:00:00'
),
(
    'PO-TL-2026-002',
    (SELECT id FROM users WHERE email = 'sumber@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo'),
    '2026-11-18', '2026-11-22',
    'Pengadaan perlengkapan administrasi.',
    'Received', NULL,
    '2026-11-18 08:30:00', '2026-11-18 11:00:00',
    NULL, '2026-11-20 09:00:00', '2026-11-22 13:00:00'
),
(
    'PO-TL-2026-003',
    (SELECT id FROM users WHERE email = 'bersih@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo'),
    '2026-11-19', '2026-11-25',
    'Pengadaan kebutuhan kebersihan gudang.',
    'Received', NULL,
    '2026-11-19 09:00:00', '2026-11-19 11:30:00',
    NULL, '2026-11-22 10:00:00', '2026-11-25 09:00:00'
),
(
    'PO-TL-2026-004',
    (SELECT id FROM users WHERE email = 'sentosa@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo'),
    '2026-11-19', '2026-11-24',
    'Pengadaan material pengemasan.',
    'Rejected', 'Penawaran harga belum sesuai dengan anggaran pengadaan.',
    '2026-11-19 10:00:00', NULL,
    '2026-11-20 09:00:00', NULL, NULL
),
(
    'PO-TL-2026-005',
    (SELECT id FROM users WHERE email = 'supplier@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo'),
    '2026-11-24', '2026-11-30',
    'Pengadaan tambahan pallet plastik.',
    'Pending', NULL,
    '2026-11-24 08:00:00', NULL, NULL, NULL, NULL
),
(
    'PO-TL-2026-006',
    (SELECT id FROM users WHERE email = 'sumber@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo'),
    '2026-11-23', '2026-11-28',
    'Pengadaan kertas dan perlengkapan administrasi.',
    'Confirmed', NULL,
    '2026-11-23 09:00:00', '2026-11-23 13:00:00',
    NULL, NULL, NULL
),
(
    'PO-TL-2026-007',
    (SELECT id FROM users WHERE email = 'bersih@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo'),
    '2026-11-24', '2026-11-29',
    'Pengadaan perlengkapan kebersihan tambahan.',
    'Confirmed', NULL,
    '2026-11-24 09:30:00', '2026-11-24 14:00:00',
    NULL, NULL, NULL
),
(
    'PO-TL-2026-008',
    (SELECT id FROM users WHERE email = 'sentosa@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo'),
    '2026-11-24', '2026-11-27',
    'Pengadaan material pengiriman.',
    'In Transit', NULL,
    '2026-11-24 10:00:00', '2026-11-24 12:00:00',
    NULL, '2026-11-25 08:00:00', NULL
);

-- =========================================================
-- 5. RESTOCK ORDER ITEMS
-- =========================================================

INSERT INTO restock_order_items (restock_order_id, product_id, quantity)
SELECT ro.id, p.id, v.quantity
FROM (
    VALUES
    ('PO-TL-2026-001', 'TL-GDG-001', 5),
    ('PO-TL-2026-001', 'TL-GDG-002', 10),
    ('PO-TL-2026-002', 'TL-KTR-001', 10),
    ('PO-TL-2026-002', 'TL-KTR-004', 20),
    ('PO-TL-2026-003', 'TL-KBR-003', 12),
    ('PO-TL-2026-003', 'TL-KBR-005', 15),
    ('PO-TL-2026-004', 'TL-PKG-001', 30),
    ('PO-TL-2026-004', 'TL-PKG-003', 50),
    ('PO-TL-2026-005', 'TL-GDG-004', 5),
    ('PO-TL-2026-006', 'TL-KTR-004', 20),
    ('PO-TL-2026-006', 'TL-KTR-005', 50),
    ('PO-TL-2026-007', 'TL-KBR-001', 15),
    ('PO-TL-2026-007', 'TL-KBR-002', 10),
    ('PO-TL-2026-008', 'TL-PKG-002', 15),
    ('PO-TL-2026-008', 'TL-PKG-004', 10)
) AS v(po_number, sku, quantity)
JOIN restock_orders ro ON ro.po_number = v.po_number
JOIN products p ON p.sku = v.sku;

-- =========================================================
-- 6. TRANSACTIONS: 10 TRANSAKSI
-- Incoming: 2 Approved, 1 Pending, 1 Rejected
-- Outgoing: 2 Shipped, 2 Approved, 1 Pending, 1 Rejected
-- =========================================================

INSERT INTO transactions
    (transaction_number, type, transaction_date,
     restock_order_id, supplier_id, customer_destination,
     notes, status, rejection_reason, created_by, approved_by)
VALUES
(
    'TRX-IN-2026-001', 'incoming', '2026-11-21',
    (SELECT id FROM restock_orders WHERE po_number = 'PO-TL-2026-001'),
    (SELECT id FROM users WHERE email = 'supplier@tataloka.demo'),
    NULL, 'Penerimaan rak penyimpanan.',
    'Approved', NULL,
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo')
),
(
    'TRX-IN-2026-002', 'incoming', '2026-11-22',
    (SELECT id FROM restock_orders WHERE po_number = 'PO-TL-2026-002'),
    (SELECT id FROM users WHERE email = 'sumber@tataloka.demo'),
    NULL, 'Penerimaan perlengkapan administrasi.',
    'Approved', NULL,
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo')
),
(
    'TRX-IN-2026-003', 'incoming', '2026-11-25',
    (SELECT id FROM restock_orders WHERE po_number = 'PO-TL-2026-003'),
    (SELECT id FROM users WHERE email = 'bersih@tataloka.demo'),
    NULL, 'Penerimaan kebutuhan kebersihan.',
    'Pending', NULL,
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    NULL
),
(
    'TRX-IN-2026-004', 'incoming', '2026-11-25',
    (SELECT id FROM restock_orders WHERE po_number = 'PO-TL-2026-003'),
    (SELECT id FROM users WHERE email = 'bersih@tataloka.demo'),
    NULL, 'Pengajuan penerimaan sebelumnya perlu diperbaiki.',
    'Rejected', 'Jumlah barang pada dokumen penerimaan tidak sesuai.',
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo')
),
(
    'TRX-OUT-2026-001', 'outgoing', '2026-11-24',
    NULL, NULL, 'Unit Operasional A',
    'Permintaan pengeluaran troli.',
    'Pending', NULL,
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    NULL
),
(
    'TRX-OUT-2026-002', 'outgoing', '2026-11-23',
    NULL, NULL, 'Unit Administrasi',
    'Pengeluaran perlengkapan kantor.',
    'Approved', NULL,
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo')
),
(
    'TRX-OUT-2026-003', 'outgoing', '2026-11-23',
    NULL, NULL, 'Unit Pengemasan',
    'Pengeluaran material untuk kebutuhan operasional.',
    'Approved', NULL,
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo')
),
(
    'TRX-OUT-2026-004', 'outgoing', '2026-11-22',
    NULL, NULL, 'Unit Kebersihan',
    'Permintaan perlengkapan kebersihan.',
    'Rejected', 'Permintaan belum disertai alasan kebutuhan yang memadai.',
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo')
),
(
    'TRX-OUT-2026-005', 'outgoing', '2026-11-21',
    NULL, NULL, 'Unit Distribusi',
    'Pengeluaran kotak organizer.',
    'Shipped', NULL,
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo')
),
(
    'TRX-OUT-2026-006', 'outgoing', '2026-11-24',
    NULL, NULL, 'Unit Pengemasan',
    'Pengeluaran cairan pembersih untuk area kerja.',
    'Shipped', NULL,
    (SELECT id FROM users WHERE email = 'staff@tataloka.demo'),
    (SELECT id FROM users WHERE email = 'manager@tataloka.demo')
);

-- =========================================================
-- 7. TRANSACTION ITEMS
-- =========================================================


INSERT INTO transaction_items (transaction_id, product_id, quantity)
SELECT t.id, p.id, v.quantity
FROM (
    VALUES
    ('TRX-IN-2026-001', 'TL-GDG-001', 5),
    ('TRX-IN-2026-001', 'TL-GDG-002', 10),

    ('TRX-IN-2026-002', 'TL-KTR-001', 10),
    ('TRX-IN-2026-002', 'TL-KTR-004', 20),

    ('TRX-IN-2026-003', 'TL-KBR-003', 12),
    ('TRX-IN-2026-003', 'TL-KBR-005', 15),

    ('TRX-IN-2026-004', 'TL-KBR-003', 12),
    ('TRX-IN-2026-004', 'TL-KBR-005', 15),

    ('TRX-OUT-2026-001', 'TL-GDG-003', 2),
    ('TRX-OUT-2026-002', 'TL-KTR-002', 2),
    ('TRX-OUT-2026-003', 'TL-KBR-002', 2),
    ('TRX-OUT-2026-004', 'TL-KBR-005', 1),
    ('TRX-OUT-2026-005', 'TL-GDG-002', 3),
    ('TRX-OUT-2026-006', 'TL-KBR-001', 5)
) AS v(transaction_number, sku, quantity)
JOIN transactions t ON t.transaction_number = v.transaction_number
JOIN products p ON p.sku = v.sku;


-- =========================================================
-- 8. HITUNG STOK AKHIR BERDASARKAN TRANSAKSI
-- Incoming Approved menambah stok.
-- Outgoing Shipped mengurangi stok.
-- Status lain tidak mengubah stok.
-- =========================================================

UPDATE products p
SET current_stock =
    p.current_stock
    + COALESCE((
        SELECT SUM(ti.quantity)
        FROM transaction_items ti
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE ti.product_id = p.id
          AND t.type = 'incoming'
          AND t.status = 'Approved'
    ), 0)
    - COALESCE((
        SELECT SUM(ti.quantity)
        FROM transaction_items ti
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE ti.product_id = p.id
          AND t.type = 'outgoing'
          AND t.status = 'Shipped'
    ), 0);

-- =========================================================
-- 9. SELESAI
-- =========================================================

COMMIT;
