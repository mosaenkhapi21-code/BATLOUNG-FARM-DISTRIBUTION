const { db } = require('../config/db');

const getTopFiveFruits = async () => {
    const [rows] = await db.query(
        `SELECT f.fruit_id, f.fruit_name,
                SUM(sd.quantity) AS total_boxes_sold,
                SUM(sd.quantity * sd.unit_price) AS revenue
         FROM sales_details sd
         JOIN fruits f ON sd.fruit_id = f.fruit_id
         GROUP BY f.fruit_id, f.fruit_name
         ORDER BY total_boxes_sold DESC
         LIMIT 5`
    );
    return rows;
};

const getSalesRevenue = async (startDate, endDate) => {
    const [rows] = await db.query(
        `SELECT sale_date,
                COUNT(*) AS number_of_sales,
                SUM(total_amount) AS total_revenue,
                SUM(amount_paid) AS total_paid,
                SUM(total_amount - amount_paid) AS outstanding_balance
         FROM sales
         WHERE sale_date BETWEEN ? AND ?
         GROUP BY sale_date
         ORDER BY sale_date`,
        [startDate, endDate]
    );
    return rows;
};

const getTopVendor = async () => {
    const [rows] = await db.query(
        `SELECT v.vendor_id, v.vendor_name,
                SUM(sd.quantity) AS total_boxes,
                SUM(sd.quantity * sd.unit_price) AS revenue
         FROM sales s
         JOIN vendors v ON s.vendor_id = v.vendor_id
         JOIN sales_details sd ON s.sale_id = sd.sale_id
         GROUP BY v.vendor_id, v.vendor_name
         ORDER BY total_boxes DESC
         LIMIT 1`
    );
    return rows;
};

const getStockReport = async () => {
    const [rows] = await db.query(
        `SELECT f.fruit_id, f.fruit_name, st.packaging_size,
                st.available_quantity
         FROM stock st
         JOIN fruits f ON st.fruit_id = f.fruit_id
         ORDER BY f.fruit_name,
                  FIELD(st.packaging_size, 'SMALL', 'MEDIUM', 'LARGE')`
    );
    return rows;
};

const getSummary = async () => {
    const [rows] = await db.query(
        `SELECT
            (SELECT COUNT(*) FROM suppliers) AS total_suppliers,
            (SELECT COUNT(*) FROM fruits) AS total_fruits,
            (SELECT COUNT(*) FROM vendors) AS total_vendors,
            (SELECT COUNT(*) FROM purchases) AS total_purchases,
            (SELECT COUNT(*) FROM sales) AS total_sales,
            (SELECT COUNT(*) FROM stock) AS stock_records,
            (SELECT COALESCE(SUM(total_amount), 0) FROM purchases) AS total_purchase_value,
            (SELECT COALESCE(SUM(total_amount), 0) FROM sales) AS total_sales_revenue,
            (SELECT COALESCE(SUM(total_amount - amount_paid), 0) FROM sales) AS outstanding_balance,
            (SELECT COALESCE(SUM(available_quantity), 0) FROM stock) AS total_stock_boxes`
    );
    return rows[0];
};

module.exports = {
    getTopFiveFruits,
    getSalesRevenue,
    getTopVendor,
    getStockReport,
    getSummary
};
