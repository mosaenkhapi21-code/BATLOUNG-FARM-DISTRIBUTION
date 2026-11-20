
const { db } = require('../config/db');

exports.getFruits = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM fruits ORDER BY fruit_id DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFruit = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM fruits WHERE fruit_id = ?',
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: 'Fruit not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createFruit = async (req, res) => {
    try {
        const { fruit_name, description, status } = req.body;

        if (!fruit_name) {
            return res.status(400).json({ message: 'Fruit name is required' });
        }

        const fruitStatus = status || 'ACTIVE';

        if (!['ACTIVE', 'INACTIVE'].includes(fruitStatus)) {
            return res.status(400).json({ message: 'Invalid fruit status' });
        }

        const [result] = await db.query(
            `INSERT INTO fruits (fruit_name, description, status)
             VALUES (?, ?, ?)`,
            [fruit_name, description || null, fruitStatus]
        );

        res.status(201).json({
            message: 'Fruit created successfully',
            fruit_id: result.insertId
        });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500)
            .json({ message: error.message });
    }
};

exports.updateFruit = async (req, res) => {
    try {
        const { fruit_name, description, status } = req.body;

        if (!fruit_name) {
            return res.status(400).json({ message: 'Fruit name is required' });
        }

        const fruitStatus = status || 'ACTIVE';

        if (!['ACTIVE', 'INACTIVE'].includes(fruitStatus)) {
            return res.status(400).json({ message: 'Invalid fruit status' });
        }

        const [result] = await db.query(
            `UPDATE fruits SET fruit_name = ?, description = ?, status = ?
             WHERE fruit_id = ?`,
            [fruit_name, description || null, fruitStatus, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Fruit not found' });
        }

        res.json({ message: 'Fruit updated successfully' });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500)
            .json({ message: error.message });
    }
};
