
const { db } = require('../config/db');

// Report 1: Top five fruits sold
exports.getTopFiveFruits = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT f.fruit_id, f.fruit_name,
                    SUM(sd.quantity) AS total_boxes_sold
             FROM sales_details sd
             JOIN fruits f ON sd.fruit_id = f.fruit_id
             GROUP BY f.fruit_id, f.fruit_name
             ORDER BY total_boxes_sold DESC
             LIMIT 5`
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Report 2: Sales revenue between dates
exports.getSalesRevenue = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                message: 'Start date and end date are required'
            });
        }

        if (start_date > end_date) {
            return res.status(400).json({
                message: 'Start date cannot be after end date'
            });
        }

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
            [start_date, end_date]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Report 3: Vendor with the most boxes purchased
exports.getTopVendor = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT v.vendor_id, v.vendor_name,
                    SUM(sd.quantity) AS total_boxes
             FROM sales s
             JOIN vendors v ON s.vendor_id = v.vendor_id
             JOIN sales_details sd ON s.sale_id = sd.sale_id
             GROUP BY v.vendor_id, v.vendor_name
             ORDER BY total_boxes DESC
             LIMIT 1`
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Report 4: Stock by fruit and packaging size
exports.getStockReport = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT f.fruit_name, st.packaging_size,
                    st.available_quantity
             FROM stock st
             JOIN fruits f ON st.fruit_id = f.fruit_id
             ORDER BY f.fruit_name,
             FIELD(st.packaging_size, 'SMALL', 'MEDIUM', 'LARGE')`
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
