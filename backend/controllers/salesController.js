
const { db } = require('../config/db');

exports.getSales = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT s.*, v.vendor_name,
             (s.total_amount - s.amount_paid) AS outstanding_balance
             FROM sales s
             JOIN vendors v ON s.vendor_id = v.vendor_id
             ORDER BY s.sale_id DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSale = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const {
            vendor_id,
            sale_date,
            payment_method,
            amount_paid,
            items
        } = req.body;

        if (!vendor_id || !sale_date || !Array.isArray(items) || !items.length) {
            return res.status(400).json({
                message: 'Vendor, sale date and sale items are required'
            });
        }

        if (!['CASH', 'MOBILE_MONEY', 'CREDIT'].includes(payment_method)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        const paid = Number(amount_paid);

        if (!Number.isFinite(paid) || paid < 0) {
            return res.status(400).json({ message: 'Invalid amount paid' });
        }

        await connection.beginTransaction();

        const [vendor] = await connection.query(
            'SELECT vendor_id FROM vendors WHERE vendor_id = ?',
            [vendor_id]
        );

        if (!vendor.length) {
            throw new Error('Vendor not found');
        }

        let total = 0;

        for (const item of items) {
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unit_price);

            if (
                !item.fruit_id ||
                !Number.isInteger(quantity) ||
                quantity <= 0 ||
                !Number.isFinite(unitPrice) ||
                unitPrice <= 0 ||
                !['SMALL', 'MEDIUM', 'LARGE'].includes(item.packaging_size)
            ) {
                throw new Error('Invalid sale item details');
            }

            const [fruit] = await connection.query(
                'SELECT fruit_id FROM fruits WHERE fruit_id = ? AND status = ?',
                [item.fruit_id, 'ACTIVE']
            );

            if (!fruit.length) {
                throw new Error(`Active fruit ${item.fruit_id} was not found`);
            }

            total += quantity * unitPrice;
        }

        if (paid > total) {
            throw new Error('Amount paid cannot be greater than the sale total');
        }

        if (payment_method !== 'CREDIT' && paid !== total) {
            throw new Error('Cash and mobile money sales must be paid in full');
        }

        const paymentStatus =
            paid === total ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'UNPAID';

        // Check every stock item before inserting the sale.
        for (const item of items) {
            const [stock] = await connection.query(
                `SELECT stock_id, available_quantity
                 FROM stock
                 WHERE fruit_id = ? AND packaging_size = ?
                 FOR UPDATE`,
                [item.fruit_id, item.packaging_size]
            );

            if (
                !stock.length ||
                Number(stock[0].available_quantity) < Number(item.quantity)
            ) {
                throw new Error(
                    `Insufficient stock for fruit ${item.fruit_id} (${item.packaging_size})`
                );
            }
        }

        const [sale] = await connection.query(
            `INSERT INTO sales
             (vendor_id, sale_date, payment_method, payment_status,
              total_amount, amount_paid)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [vendor_id, sale_date, payment_method, paymentStatus, total, paid]
        );

        for (const item of items) {
            await connection.query(
                `INSERT INTO sales_details
                 (sale_id, fruit_id, packaging_size, quantity, unit_price)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    sale.insertId,
                    item.fruit_id,
                    item.packaging_size,
                    item.quantity,
                    item.unit_price
                ]
            );

            await connection.query(
                `UPDATE stock
                 SET available_quantity = available_quantity - ?
                 WHERE fruit_id = ? AND packaging_size = ?`,
                [item.quantity, item.fruit_id, item.packaging_size]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: 'Sale recorded and stock updated successfully',
            sale_id: sale.insertId,
            total_amount: total,
            amount_paid: paid,
            outstanding_balance: total - paid,
            payment_status: paymentStatus
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        res.status(400).json({ message: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
