
const { db } = require('../config/db');

exports.getSuppliers = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM suppliers ORDER BY supplier_id DESC'
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSupplier = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM suppliers WHERE supplier_id = ?',
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const { business_name, contact_person, phone, province, address } = req.body;

        if (!business_name || !contact_person || !phone || !province || !address) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await db.query(
            `INSERT INTO suppliers
            (business_name, contact_person, phone, province, address)
            VALUES (?, ?, ?, ?, ?)`,
            [business_name, contact_person, phone, province, address]
        );

        res.status(201).json({
            message: 'Supplier created successfully',
            supplier_id: result.insertId
        });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500)
            .json({ message: error.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const { business_name, contact_person, phone, province, address } = req.body;

        if (!business_name || !contact_person || !phone || !province || !address) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await db.query(
            `UPDATE suppliers SET business_name = ?, contact_person = ?,
            phone = ?, province = ?, address = ? WHERE supplier_id = ?`,
            [business_name, contact_person, phone, province, address, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json({ message: 'Supplier updated successfully' });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500)
            .json({ message: error.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM suppliers WHERE supplier_id = ?',
            [req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(error.code === 'ER_ROW_IS_REFERENCED_2' ? 409 : 500)
            .json({ message: error.message });
    }
};
