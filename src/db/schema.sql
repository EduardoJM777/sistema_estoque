CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE OR REPLACE FUNCTION fn_update_stock() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'IN' THEN
        UPDATE products SET quantity = quantity + NEW.quantity WHERE id = NEW.product_id;
    ELSE
        UPDATE products SET quantity = quantity - NEW.quantity WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_movement_stock ON movements;
CREATE TRIGGER trg_movement_stock
AFTER INSERT ON movements
FOR EACH ROW
EXECUTE FUNCTION fn_update_stock();

CREATE OR REPLACE VIEW low_stock_products AS
SELECT p.id, p.name, p.quantity, p.min_quantity, c.name AS category
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.quantity < p.min_quantity;