
const { db } = require('../config/db');

exports.getVendors = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM vendors ORDER BY vendor_id DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVendor = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM vendors WHERE vendor_id = ?',
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchVendors = async (req, res) => {
    try {
        const search = `%${req.query.q || ''}%`;

        const [rows] = await db.query(
            `SELECT * FROM vendors
             WHERE vendor_name LIKE ? OR phone_number LIKE ?
             OR location LIKE ?
             ORDER BY vendor_name`,
            [search, search, search]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVendor = async (req, res) => {
    try {
        const { vendor_name, phone_number, location } = req.body;

        if (!vendor_name || !phone_number || !location) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await db.query(
            `INSERT INTO vendors (vendor_name, phone_number, location)
             VALUES (?, ?, ?)`,
            [vendor_name, phone_number, location]
        );

        res.status(201).json({
            message: 'Vendor created successfully',
            vendor_id: result.insertId
        });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500)
            .json({ message: error.message });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        const { vendor_name, phone_number, location } = req.body;

        if (!vendor_name || !phone_number || !location) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await db.query(
            `UPDATE vendors SET vendor_name = ?, phone_number = ?, location = ?
             WHERE vendor_id = ?`,
            [vendor_name, phone_number, location, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json({ message: 'Vendor updated successfully' });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500)
            .json({ message: error.message });
    }
};
