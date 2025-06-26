-- Insert test user first (if doesn't exist)
INSERT INTO users (id, email, full_name, postal_code, life_stage) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'M5V2T6', 'new_parent')
ON CONFLICT (email) DO NOTHING;

-- Insert sample transactions for testing
INSERT INTO transactions (user_id, transaction_id, timestamp, product_name, category, quantity, price, store_id, life_stage) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'TXN001', now() - interval '1 day', 'Organic Baby Food', 'Groceries', 2, 12.99, 'STORE_WHOLEFOODS', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN001', now() - interval '1 day', 'Milk', 'Groceries', 1, 4.50, 'STORE_WHOLEFOODS', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN002', now() - interval '3 days', 'Baby Monitor', 'Baby Care', 1, 89.95, 'STORE_TARGET', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN003', now() - interval '2 days', 'Diapers', 'Baby Care', 3, 15.00, 'STORE_PHARMACY', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN003', now() - interval '2 days', 'Baby Wipes', 'Baby Care', 2, 8.99, 'STORE_PHARMACY', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN004', now() - interval '5 days', 'Coffee', 'Food & Dining', 1, 4.75, 'STORE_STARBUCKS', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN005', now() - interval '4 days', 'Weekly Groceries', 'Groceries', 1, 67.30, 'STORE_SUPERMARKET', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN005', now() - interval '4 days', 'Bread', 'Groceries', 2, 3.50, 'STORE_SUPERMARKET', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN006', now() - interval '6 days', 'Baby Clothes', 'Baby Care', 1, 24.99, 'STORE_AMAZON', 'new_parent'),
('550e8400-e29b-41d4-a716-446655440000', 'TXN007', now() - interval '7 days', 'Lunch', 'Food & Dining', 1, 12.50, 'STORE_RESTAURANT', 'new_parent'); 