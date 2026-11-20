USE `batloung_farm`;

INSERT IGNORE INTO admins (admin_id, username, password) VALUES
    (1, 'admin', '$2b$10$QE2lYgDlsaQzSiAP5jJ28O/g3xSfJxUNdYZyMN.DqtRt2spKpLE56');

INSERT IGNORE INTO suppliers
    (supplier_id, business_name, contact_person, phone, province, address)
VALUES
    (1, 'Fresh Harvest Suppliers', 'John Smith', '0812345678', 'Gauteng', 'Johannesburg'),
    (2, 'Green Valley Farms', 'Mary Jones', '0823456789', 'Free State', 'Bloemfontein'),
    (3, 'Citrus Coast Traders', 'Sipho Dlamini', '0834567890', 'KwaZulu-Natal', 'Durban'),
    (4, 'Cape Fruit Exporters', 'Anna Botha', '0845678901', 'Western Cape', 'Cape Town'),
    (5, 'Sunshine Produce', 'Lerato Mokoena', '0856789012', 'Eastern Cape', 'Port Elizabeth'),
    (6, 'Limpopo Fresh Pack', 'Peter Mabunda', '0867890123', 'Limpopo', 'Polokwane'),
    (7, 'Highveld Orchards', 'Thabo Nkosi', '0878901234', 'Mpumalanga', 'Nelspruit'),
    (8, 'North West Growers', 'Grace Molefe', '0889012345', 'North West', 'Mahikeng');

INSERT IGNORE INTO fruits (fruit_id, fruit_name, description, status) VALUES
    (1, 'Apples', 'Fresh red apples', 'ACTIVE'),
    (2, 'Bananas', 'Fresh yellow bananas', 'ACTIVE'),
    (3, 'Oranges', 'Fresh juicy oranges', 'ACTIVE'),
    (4, 'Mangoes', 'Sweet ripe mangoes', 'ACTIVE'),
    (5, 'Grapes', 'Fresh seedless grapes', 'ACTIVE');

INSERT IGNORE INTO fruit_prices (price_id, fruit_id, packaging_size, unit_price) VALUES
    (1, 1, 'SMALL', 30.00),
    (2, 1, 'MEDIUM', 50.00),
    (3, 1, 'LARGE', 80.00),
    (4, 2, 'SMALL', 25.00),
    (5, 2, 'MEDIUM', 45.00),
    (6, 2, 'LARGE', 70.00),
    (7, 3, 'SMALL', 28.00),
    (8, 3, 'MEDIUM', 48.00),
    (9, 3, 'LARGE', 75.00),
    (10, 4, 'SMALL', 35.00),
    (11, 4, 'MEDIUM', 60.00),
    (12, 4, 'LARGE', 90.00),
    (13, 5, 'SMALL', 40.00),
    (14, 5, 'MEDIUM', 65.00),
    (15, 5, 'LARGE', 100.00);

INSERT IGNORE INTO vendors
    (vendor_id, vendor_name, phone_number, location, registration_date)
VALUES
    (1, 'Maseru Street Vendors', '58111222', 'Maseru', '2026-11-10'),
    (2, 'Fresh Market Traders', '58222333', 'Maseru', '2026-11-11'),
    (3, 'City Fruit Shop', '58333444', 'Maseru', '2026-11-12'),
    (4, 'Green Basket Store', '58444555', 'Leribe', '2026-11-13'),
    (5, 'Healthy Foods Market', '58555666', 'Mafeteng', '2026-11-14');

INSERT IGNORE INTO purchases (purchase_id, supplier_id, purchase_date, total_amount) VALUES
    (1, 1, '2026-11-10', 5040.00),
    (2, 2, '2026-11-12', 2960.00),
    (3, 3, '2026-11-14', 2630.00),
    (4, 4, '2026-11-16', 2950.00),
    (5, 5, '2026-11-18', 3085.00);

INSERT IGNORE INTO purchase_details
    (purchase_detail_id, purchase_id, fruit_id, quantity, unit_cost, packaging_size)
VALUES
    (1, 1, 1, 100, 20.00, 'SMALL'),
    (2, 1, 1, 50, 32.00, 'MEDIUM'),
    (3, 1, 1, 30, 48.00, 'LARGE'),
    (4, 2, 2, 80, 15.00, 'SMALL'),
    (5, 2, 2, 40, 25.00, 'MEDIUM'),
    (6, 2, 2, 20, 38.00, 'LARGE'),
    (7, 3, 3, 70, 16.00, 'SMALL'),
    (8, 3, 3, 35, 26.00, 'MEDIUM'),
    (9, 3, 3, 15, 40.00, 'LARGE'),
    (10, 4, 4, 60, 22.00, 'SMALL'),
    (11, 4, 4, 30, 36.00, 'MEDIUM'),
    (12, 4, 4, 10, 55.00, 'LARGE'),
    (13, 5, 5, 50, 28.00, 'SMALL'),
    (14, 5, 5, 25, 45.00, 'MEDIUM'),
    (15, 5, 5, 8, 70.00, 'LARGE');

INSERT IGNORE INTO sales
    (sale_id, vendor_id, sale_date, payment_method, payment_status, total_amount, amount_paid)
VALUES
    (1, 1, '2026-11-19', 'CASH', 'PAID', 650.00, 650.00),
    (2, 2, '2026-11-19', 'MOBILE_MONEY', 'PAID', 594.00, 594.00),
    (3, 3, '2026-11-20', 'CREDIT', 'PARTIALLY_PAID', 560.00, 100.00),
    (4, 4, '2026-11-20', 'CREDIT', 'UNPAID', 225.00, 0.00),
    (5, 5, '2026-11-20', 'CASH', 'PAID', 425.00, 425.00);

INSERT IGNORE INTO sales_details
    (sales_detail_id, sale_id, fruit_id, packaging_size, quantity, unit_price)
VALUES
    (1, 1, 1, 'LARGE', 5, 80.00),
    (2, 1, 2, 'SMALL', 10, 25.00),
    (3, 2, 3, 'MEDIUM', 8, 48.00),
    (4, 2, 4, 'SMALL', 6, 35.00),
    (5, 3, 1, 'SMALL', 12, 30.00),
    (6, 3, 5, 'LARGE', 2, 100.00),
    (7, 4, 2, 'MEDIUM', 5, 45.00),
    (8, 5, 1, 'MEDIUM', 4, 50.00),
    (9, 5, 3, 'LARGE', 3, 75.00);

INSERT IGNORE INTO stock (stock_id, fruit_id, packaging_size, available_quantity) VALUES
    (1, 1, 'SMALL', 88),
    (2, 1, 'MEDIUM', 46),
    (3, 1, 'LARGE', 25),
    (4, 2, 'SMALL', 70),
    (5, 2, 'MEDIUM', 35),
    (6, 2, 'LARGE', 20),
    (7, 3, 'SMALL', 70),
    (8, 3, 'MEDIUM', 27),
    (9, 3, 'LARGE', 12),
    (10, 4, 'SMALL', 54),
    (11, 4, 'MEDIUM', 30),
    (12, 4, 'LARGE', 10),
    (13, 5, 'SMALL', 50),
    (14, 5, 'MEDIUM', 25),
    (15, 5, 'LARGE', 6);

INSERT IGNORE INTO payments (payment_id, sale_id, payment_date, payment_method, amount) VALUES
    (1, 1, '2026-11-19', 'CASH', 650.00),
    (2, 2, '2026-11-19', 'MOBILE_MONEY', 594.00),
    (3, 3, '2026-11-20', 'MOBILE_MONEY', 100.00),
    (4, 5, '2026-11-20', 'CASH', 425.00);
