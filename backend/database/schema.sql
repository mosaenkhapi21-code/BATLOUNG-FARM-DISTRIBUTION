CREATE DATABASE IF NOT EXISTS `batloung_farm`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `batloung_farm`;

CREATE TABLE IF NOT EXISTS admins (
    admin_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(150) NOT NULL UNIQUE,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    province ENUM(
        'Eastern Cape',
        'Free State',
        'Gauteng',
        'KwaZulu-Natal',
        'Limpopo',
        'Mpumalanga',
        'Northern Cape',
        'North West',
        'Western Cape'
    ) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fruits (
    fruit_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fruit_name VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fruit_prices (
    price_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fruit_id INT UNSIGNED NOT NULL,
    packaging_size ENUM('SMALL', 'MEDIUM', 'LARGE') NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_fruit_price (fruit_id, packaging_size),
    CONSTRAINT fk_fruit_price_fruit
        FOREIGN KEY (fruit_id) REFERENCES fruits (fruit_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vendors (
    vendor_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL UNIQUE,
    location VARCHAR(120) NOT NULL,
    registration_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchases (
    purchase_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT UNSIGNED NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchase_details (
    purchase_detail_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT UNSIGNED NOT NULL,
    fruit_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(10, 2) NOT NULL CHECK (unit_cost > 0),
    packaging_size ENUM('SMALL', 'MEDIUM', 'LARGE') NOT NULL,
    UNIQUE KEY uq_purchase_item (purchase_id, fruit_id, packaging_size),
    CONSTRAINT fk_purchase_detail_purchase
        FOREIGN KEY (purchase_id) REFERENCES purchases (purchase_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_detail_fruit
        FOREIGN KEY (fruit_id) REFERENCES fruits (fruit_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales (
    sale_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT UNSIGNED NOT NULL,
    sale_date DATE NOT NULL,
    payment_method ENUM('CASH', 'MOBILE_MONEY', 'CREDIT') NOT NULL,
    payment_status ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_sale_payment CHECK (amount_paid <= total_amount),
    CONSTRAINT fk_sale_vendor
        FOREIGN KEY (vendor_id) REFERENCES vendors (vendor_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales_details (
    sales_detail_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sale_id INT UNSIGNED NOT NULL,
    fruit_id INT UNSIGNED NOT NULL,
    packaging_size ENUM('SMALL', 'MEDIUM', 'LARGE') NOT NULL,
    quantity INT UNSIGNED NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
    UNIQUE KEY uq_sale_item (sale_id, fruit_id, packaging_size),
    CONSTRAINT fk_sale_detail_sale
        FOREIGN KEY (sale_id) REFERENCES sales (sale_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sale_detail_fruit
        FOREIGN KEY (fruit_id) REFERENCES fruits (fruit_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stock (
    stock_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fruit_id INT UNSIGNED NOT NULL,
    packaging_size ENUM('SMALL', 'MEDIUM', 'LARGE') NOT NULL,
    available_quantity INT UNSIGNED NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_stock_item (fruit_id, packaging_size),
    CONSTRAINT fk_stock_fruit
        FOREIGN KEY (fruit_id) REFERENCES fruits (fruit_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sale_id INT UNSIGNED NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('CASH', 'MOBILE_MONEY', 'CREDIT') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_sale
        FOREIGN KEY (sale_id) REFERENCES sales (sale_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
