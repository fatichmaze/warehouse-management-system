CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL
        CHECK (role IN ('admin', 'warehouse_manager', 'staff', 'supplier')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    company_name VARCHAR(150),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT,
    purchase_price NUMERIC NOT NULL CHECK (purchase_price >= 0),
    selling_price NUMERIC NOT NULL CHECK (selling_price >= 0),
    min_stock INTEGER NOT NULL CHECK (min_stock >= 0),
    low_stock INTEGER NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0
        CHECK (current_stock >= 0),
    unit VARCHAR(30) NOT NULL,
    rack_location VARCHAR(50) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT products_low_stock_check
        CHECK (low_stock > min_stock),

    CONSTRAINT products_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS restock_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Confirmed', 'Rejected', 'In Transit', 'Received')),
    status_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT restock_orders_check
        CHECK (
            status <> 'Rejected'
            OR NULLIF(TRIM(status_notes), '') IS NOT NULL
        ),

    CONSTRAINT restock_orders_check1
        CHECK (expected_delivery_date >= order_date),

    FOREIGN KEY (supplier_id)
        REFERENCES users(id) ON DELETE RESTRICT,

    FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS restock_order_items (
    id SERIAL PRIMARY KEY,
    restock_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    UNIQUE (restock_order_id, product_id),

    FOREIGN KEY (restock_order_id)
        REFERENCES restock_orders(id) ON DELETE RESTRICT,

    FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('incoming', 'outgoing')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    restock_order_id INTEGER,
    supplier_id INTEGER,
    customer_destination VARCHAR(150),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Shipped')),
    rejection_reason TEXT,
    created_by INTEGER NOT NULL,
    approved_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT transactions_type_status_check
        CHECK (
            (type = 'incoming' AND status IN ('Pending', 'Approved', 'Rejected'))
            OR
            (type = 'outgoing' AND status IN ('Pending', 'Approved', 'Rejected', 'Shipped'))
        ),

    CONSTRAINT transactions_rejection_check
        CHECK (
            status <> 'Rejected'
            OR NULLIF(TRIM(rejection_reason), '') IS NOT NULL
        ),

    CONSTRAINT transactions_restock_check
        CHECK (type = 'incoming' OR restock_order_id IS NULL),

    FOREIGN KEY (restock_order_id)
        REFERENCES restock_orders(id) ON DELETE RESTRICT,

    FOREIGN KEY (supplier_id)
        REFERENCES users(id) ON DELETE RESTRICT,

    FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT,

    FOREIGN KEY (approved_by)
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    UNIQUE (transaction_id, product_id),

    FOREIGN KEY (transaction_id)
        REFERENCES transactions(id) ON DELETE RESTRICT,

    FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE RESTRICT
);