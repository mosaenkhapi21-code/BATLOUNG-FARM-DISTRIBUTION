const { db } = require('../config/db');

const getVendorBalances = async () => {
    const [rows] = await db.query(
        `SELECT v.vendor_id, v.vendor_name, v.phone_number, v.location,
                COUNT(s.sale_id) AS sale_count,
                COALESCE(SUM(s.total_amount), 0) AS total_sales,
                COALESCE(SUM(s.amount_paid), 0) AS total_paid,
                COALESCE(SUM(s.total_amount - s.amount_paid), 0) AS outstanding_balance
         FROM vendors v
         LEFT JOIN sales s ON v.vendor_id = s.vendor_id
         GROUP BY v.vendor_id, v.vendor_name, v.phone_number, v.location
         ORDER BY outstanding_balance DESC, v.vendor_name`
    );
    return rows;
};

const getPayments = async () => {
    const [rows] = await db.query(
        `SELECT p.*, s.vendor_id, v.vendor_name
         FROM payments p
         JOIN sales s ON p.sale_id = s.sale_id
         JOIN vendors v ON s.vendor_id = v.vendor_id
         ORDER BY p.payment_id DESC`
    );
    return rows;
};

module.exports = { getVendorBalances, getPayments };
