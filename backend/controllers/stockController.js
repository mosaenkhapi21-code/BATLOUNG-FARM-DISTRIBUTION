
const { db } = require('../config/db');

exports.getStock = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT st.stock_id, st.fruit_id, f.fruit_name,
                    st.packaging_size, st.available_quantity
             FROM stock st
             JOIN fruits f ON st.fruit_id = f.fruit_id
             ORDER BY f.fruit_name, st.packaging_size`
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStockByFruit = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT st.*, f.fruit_name
             FROM stock st
             JOIN fruits f ON st.fruit_id = f.fruit_id
             WHERE st.fruit_id = ?
             ORDER BY st.packaging_size`,
            [req.params.fruit_id]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const threshold = Number(req.query.threshold ?? 20);

        if (!Number.isInteger(threshold) || threshold < 0) {
            return res.status(400).json({
                message: 'Threshold must be a non-negative whole number'
            });
        }

        const [rows] = await db.query(
            `SELECT st.*, f.fruit_name
             FROM stock st
             JOIN fruits f ON st.fruit_id = f.fruit_id
             WHERE st.available_quantity <= ?
             ORDER BY st.available_quantity ASC`,
            [threshold]
        );

        res.json({
            threshold,
            low_stock_items: rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
