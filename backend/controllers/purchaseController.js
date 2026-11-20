
const { db } = require('../config/db');

exports.getPurchases = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, s.business_name
             FROM purchases p
             JOIN suppliers s ON p.supplier_id = s.supplier_id
             ORDER BY p.purchase_id DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPurchase = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { supplier_id, purchase_date, items } = req.body;

        if (!supplier_id || !purchase_date || !Array.isArray(items) || !items.length) {
            connection.release();
            return res.status(400).json({
                message: 'Supplier, purchase date and items are required'
            });
        }

        await connection.beginTransaction();

        const [supplier] = await connection.query(
            'SELECT supplier_id FROM suppliers WHERE supplier_id = ?',
            [supplier_id]
        );

        if (!supplier.length) {
            throw new Error('Supplier does not exist');
        }

        let total = 0;

        for (const item of items) {
            const { fruit_id, quantity, unit_cost, packaging_size } = item;

            if (
                !fruit_id ||
                !Number.isInteger(Number(quantity)) ||
                Number(quantity) <= 0 ||
                !Number.isFinite(Number(unit_cost)) ||
                Number(unit_cost) <= 0 ||
                !['SMALL', 'MEDIUM', 'LARGE'].includes(packaging_size)
            ) {
                throw new Error('Invalid purchase item details');
            }

            const [fruit] = await connection.query(
                'SELECT fruit_id FROM fruits WHERE fruit_id = ? AND status = ?',
                [fruit_id, 'ACTIVE']
            );

            if (!fruit.length) {
                throw new Error(`Active fruit ${fruit_id} was not found`);
            }

            total += Number(quantity) * Number(unit_cost);
        }

        const [purchase] = await connection.query(
            `INSERT INTO purchases (supplier_id, purchase_date, total_amount)
             VALUES (?, ?, ?)`,
            [supplier_id, purchase_date, total]
        );

        for (const item of items) {
            const quantity = Number(item.quantity);
            const unitCost = Number(item.unit_cost);

            await connection.query(
                `INSERT INTO purchase_details
                 (purchase_id, fruit_id, quantity, unit_cost, packaging_size)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    purchase.insertId,
                    item.fruit_id,
                    quantity,
                    unitCost,
                    item.packaging_size
                ]
            );

            const [stock] = await connection.query(
                `SELECT stock_id FROM stock
                 WHERE fruit_id = ? AND packaging_size = ? FOR UPDATE`,
                [item.fruit_id, item.packaging_size]
            );

            if (stock.length) {
                await connection.query(
                    `UPDATE stock
                     SET available_quantity = available_quantity + ?
                     WHERE stock_id = ?`,
                    [quantity, stock[0].stock_id]
                );
            } else {
                await connection.query(
                    `INSERT INTO stock (fruit_id, packaging_size, available_quantity)
                     VALUES (?, ?, ?)`,
                    [item.fruit_id, item.packaging_size, quantity]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            message: 'Purchase recorded and stock updated successfully',
            purchase_id: purchase.insertId,
            total_amount: total
        });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
};
