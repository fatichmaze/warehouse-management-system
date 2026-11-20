
-- =====================================================
-- SEED DATA USERS
-- =====================================================

INSERT INTO users (name, email, password, role, status)
VALUES
    ('Administrator', 'admin@wms.com', '$2b$10$/TarKEVBE4B7i7srp8w6Lecra9DpdQq5eod.ZArB.loQI12M0Ju0e', 'admin', 'approved'),
    ('Warehouse Manager', 'manager@wms.com', '$2b$10$t0hO/bpovSJ4F0LS9.dYg.XdkeGjI1QbjRYun5k/KjurmiE9vnL.6', 'warehouse_manager', 'approved'),
    ('Staff Gudang', 'staff@wms.com', '$2b$10$M7dhIshWksl9tyqdF5IpH.FNyjx3dWrRKYAJGm.SyC9uIBKN3RQyG', 'staff', 'approved')
ON CONFLICT (email) DO NOTHING;


-- =====================================================
-- SEED DATA CATEGORIES & PRODUCTS TATALOKA
-- =====================================================

BEGIN;

-- 1. KATEGORI
INSERT INTO public.categories (name, description)
VALUES
    (
        'Perlengkapan Gudang',
        'Peralatan untuk penyimpanan dan pengelolaan barang di gudang.'
    ),
    (
        'Peralatan Kantor',
        'Perlengkapan pendukung aktivitas administrasi kantor.'
    ),
    (
        'Perlengkapan Kebersihan',
        'Produk untuk menjaga kebersihan area kerja dan gudang.'
    ),
    (
        'Peralatan Packing',
        'Material untuk pengemasan dan persiapan pengiriman barang.'
    )
ON CONFLICT (name) DO NOTHING;


-- 2. PRODUK
INSERT INTO public.products (
    sku,
    name,
    category_id,
    description,
    purchase_price,
    selling_price,
    min_stock,
    low_stock,
    current_stock,
    unit,
    rack_location
)
SELECT
    data.sku,
    data.name,
    c.id,
    data.description,
    data.purchase_price,
    data.selling_price,
    data.min_stock,
    data.low_stock,
    data.current_stock,
    data.unit,
    data.rack_location
FROM (
    VALUES
    (
        'TL-GDG-001',
        'Rak Penyimpanan Besi',
        'Perlengkapan Gudang',
        'Rak besi untuk penyimpanan inventaris.',
        450000, 575000, 2, 5, 8, 'Unit', 'A-01'
    ),
    (
        'TL-GDG-002',
        'Kotak Organizer Plastik',
        'Perlengkapan Gudang',
        'Kotak untuk mengelompokkan barang kecil.',
        28000, 40000, 10, 20, 35, 'Pcs', 'A-02'
    ),
    (
        'TL-GDG-003',
        'Troli Barang Lipat',
        'Perlengkapan Gudang',
        'Troli untuk memindahkan barang.',
        325000, 410000, 2, 5, 4, 'Unit', 'A-03'
    ),
    (
        'TL-KTR-001',
        'Stapler Heavy Duty',
        'Peralatan Kantor',
        'Stapler kapasitas besar untuk dokumen.',
        68000, 95000, 5, 10, 18, 'Pcs', 'B-01'
    ),
    (
        'TL-KTR-002',
        'Papan Tulis Magnetik',
        'Peralatan Kantor',
        'Papan tulis untuk kebutuhan koordinasi.',
        185000, 245000, 2, 5, 7, 'Unit', 'B-02'
    ),
    (
        'TL-KTR-003',
        'Map Arsip Tebal',
        'Peralatan Kantor',
        'Map untuk menyimpan dokumen administrasi.',
        12000, 18000, 15, 30, 50, 'Pcs', 'B-03'
    ),
    (
        'TL-KBR-001',
        'Cairan Pembersih Lantai',
        'Perlengkapan Kebersihan',
        'Cairan pembersih untuk area kerja.',
        22000, 30000, 10, 20, 28, 'Botol', 'C-01'
    ),
    (
        'TL-KBR-002',
        'Sapu Industri',
        'Perlengkapan Kebersihan',
        'Sapu untuk membersihkan area gudang.',
        35000, 48000, 5, 10, 14, 'Pcs', 'C-02'
    ),
    (
        'TL-KBR-003',
        'Tempat Sampah 50 Liter',
        'Perlengkapan Kebersihan',
        'Tempat sampah untuk area operasional.',
        95000, 125000, 3, 6, 2, 'Unit', 'C-03'
    ),
    (
        'TL-PKG-001',
        'Lakban Bening 48 mm',
        'Peralatan Packing',
        'Lakban untuk menutup kemasan kardus.',
        9500, 14000, 20, 40, 65, 'Roll', 'D-01'
    ),
    (
        'TL-PKG-002',
        'Bubble Wrap 50 cm',
        'Peralatan Packing',
        'Material pelindung barang saat pengiriman.',
        28000, 39000, 10, 20, 15, 'Roll', 'D-02'
    ),
    (
        'TL-PKG-003',
        'Kardus Packing Sedang',
        'Peralatan Packing',
        'Kardus untuk pengemasan barang ukuran sedang.',
        6500, 9500, 25, 50, 80, 'Pcs', 'D-03'
    )
) AS data (
    sku,
    name,
    category_name,
    description,
    purchase_price,
    selling_price,
    min_stock,
    low_stock,
    current_stock,
    unit,
    rack_location
)
INNER JOIN public.categories c
    ON c.name = data.category_name
WHERE NOT EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.sku = data.sku
);

COMMIT;
