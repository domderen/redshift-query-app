-- Create sample tables for our Redshift emulator

-- Create a products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2),
    stock_quantity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into products
INSERT INTO products (product_name, category, price, stock_quantity) VALUES
('Laptop', 'Electronics', 1299.99, 45),
('Smartphone', 'Electronics', 899.99, 120),
('Headphones', 'Electronics', 199.99, 78),
('Coffee Maker', 'Kitchen', 89.99, 34),
('Blender', 'Kitchen', 49.99, 52),
('Running Shoes', 'Sports', 129.99, 65),
('Yoga Mat', 'Sports', 29.99, 88),
('Desk Chair', 'Furniture', 199.99, 23),
('Desk Lamp', 'Furniture', 39.99, 41),
('Backpack', 'Accessories', 59.99, 103);

-- Create the invoices table with image_path column
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    price DECIMAL(10, 2),
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into invoices
INSERT INTO invoices (item_name, category, status, price, image_path) VALUES
('Product Photo 1', 'Marketing', 'pending', 0.00, 'product-images/photo1.webp'),
('Product Photo 2', 'Marketing', 'approved', 0.00, 'product-images/photo2.webp'),
('Product Photo 3', 'Marketing', 'rejected', 0.00, 'product-images/photo3.webp');

-- Create a table for invoices_features
CREATE TABLE invoices_features (
    id SERIAL PRIMARY KEY,
    approvable_id INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approvable_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Insert sample features data
INSERT INTO invoices_features (approvable_id, features) VALUES
(1, '{"invoice_number": "INV-2025-001", "customer": "Acme Corp", "department": "Sales"}'::jsonb),
(2, '{"invoice_number": "INV-2025-002", "customer": "TechStart Inc", "priority": "high"}'::jsonb),
(3, '{"invoice_number": "INV-2025-003", "customer": "Global Services", "reason": "incorrect amount"}'::jsonb);

-- Create a users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into users
INSERT INTO users (username, email) VALUES
('user1', 'user1@example.com'),
('user2', 'user2@example.com'),
('user3', 'user3@example.com'),
('user4', 'user4@example.com'),
('user5', 'user5@example.com');

-- Create a orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2)
);

-- Insert sample data into orders
INSERT INTO orders (user_id, total_amount) VALUES
(1, 1499.98),
(2, 279.98),
(3, 899.99),
(4, 159.98),
(1, 239.98);

-- Create a order_items table
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER,
    price DECIMAL(10, 2)
);

-- Insert sample data into order_items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1299.99),
(1, 3, 1, 199.99),
(2, 5, 1, 49.99),
(2, 7, 1, 29.99),
(2, 10, 1, 59.99),
(2, 9, 1, 39.99),
(2, 4, 1, 89.99),
(3, 2, 1, 899.99),
(4, 6, 1, 129.99),
(4, 7, 1, 29.99),
(5, 3, 1, 199.99),
(5, 9, 1, 39.99);
