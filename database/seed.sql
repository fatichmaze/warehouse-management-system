INSERT INTO users (name, email, password, role, status)
VALUES
    ('Administrator', 'admin@wms.com', '$2b$10$/TarKEVBE4B7i7srp8w6Lecra9DpdQq5eod.ZArB.loQI12M0Ju0e', 'admin', 'approved'),
    ('Warehouse Manager', 'manager@wms.com', '$2b$10$t0hO/bpovSJ4F0LS9.dYg.XdkeGjI1QbjRYun5k/KjurmiE9vnL.6', 'warehouse_manager', 'approved'),
    ('Staff Gudang', 'staff@wms.com', '$2b$10$M7dhIshWksl9tyqdF5IpH.FNyjx3dWrRKYAJGm.SyC9uIBKN3RQyG', 'staff', 'approved')
ON CONFLICT (email) DO NOTHING;