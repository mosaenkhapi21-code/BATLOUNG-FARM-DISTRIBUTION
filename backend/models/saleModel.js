const { db } = require('../config/db');
const { PACKAGING_SIZES, PAYMENT_METHODS } = require('../config/constants');
const { httpError } = require('../utils/httpError');

const saleSelect = `
    SELECT s.*, v.vendor_name,
           (s.total_amount - s.amount_paid) AS outstanding_balance,
           COUNT(sd.sales_detail_id) AS items
    FROM sales s
    JOIN vendors v ON s.vendor_id = v.vendor_id
    LEFT JOIN sales_details sd ON s.sale_id = sd.sale_id
`;

const saleGroup =
    'GROUP BY s.sale_id, v.vendor_name, s.vendor_id, s.sale_date, s.payment_method, s.payment_status, s.total_amount, s.amount_paid, s.created_at';

function getPaymentStatus(total, paid) {
    if (Number(paid) >= Number(total)) {
        return 'PAID';
    }

    if (Number(paid) > 0) {
        return 'PARTIALLY_PAID';
    }

    return 'UNPAID';
}

const getSales = async () => {
    const [rows] = await db.query(
        `${saleSelect} ${saleGroup} ORDER BY s.sale_id DESC`
    );
    return rows;
};

const getSaleById = async (saleId) => {
    const [sales] = await db.query(
        `${saleSelect} WHERE s.sale_id = ? ${saleGroup}`,
        [saleId]
    );

    if (!sales.length) {
        return null;
    }

    const [details] = await db.query(
        `SELECT sd.*, f.fruit_name
         FROM sales_details sd
         JOIN fruits f ON sd.fruit_id = f.fruit_id
         WHERE sd.sale_id = ?
         ORDER BY sd.sales_detail_id`,
        [saleId]
    );

    const [payments] = await db.query(
        `SELECT payment_id, payment_date, payment_method, amount
         FROM payments
         WHERE sale_id = ?
         ORDER BY payment_id`,
        [saleId]
    );

    return { ...sales[0], details, payments };
};

const createSale = async (payload) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        await connection.query('BEGIN');
        transactionStarted = true;

        const [vendors] = await connection.query(
            'SELECT vendor_id FROM vendors WHERE vendor_id = ?',
            [payload.vendor_id]
        );

        if (!vendors.length) {
            throw httpError(404, 'Vendor not found');
        }

        if (!PAYMENT_METHODS.includes(payload.payment_method)) {
            throw httpError(400, 'Invalid payment method');
        }

        const amountPaid = Number(payload.amount_paid ?? 0);

        if (!Number.isFinite(amountPaid) || amountPaid < 0) {
            throw httpError(400, 'Invalid amount paid');
        }

        const aggregatedItems = new Map();
        let totalAmount = 0;

        for (const item of payload.items) {
            const quantity = Number(item.quantity);
            const fruitId = Number(item.fruit_id);

            if (
                !Number.isInteger(fruitId) ||
                fruitId <= 0 ||
                !Number.isInteger(quantity) ||
                quantity <= 0 ||
                !PACKAGING_SIZES.includes(item.packaging_size)
            ) {
                throw httpError(400, 'Invalid sale item details');
            }

            const [priceRows] = await connection.query(
                `SELECT fp.unit_price
                 FROM fruit_prices fp
                 JOIN fruits f ON fp.fruit_id = f.fruit_id
                 WHERE fp.fruit_id = ?
                   AND fp.packaging_size = ?
                   AND f.status = 'ACTIVE'`,
                [fruitId, item.packaging_size]
            );

            if (!priceRows.length) {
                throw httpError(
                    400,
                    `No active price found for fruit ${fruitId} (${item.packaging_size})`
                );
            }

            const unitPrice = Number(priceRows[0].unit_price);
            const key = `${fruitId}:${item.packaging_size}`;

            if (aggregatedItems.has(key)) {
                aggregatedItems.get(key).quantity += quantity;
            } else {
                aggregatedItems.set(key, {
                    fruit_id: fruitId,
                    packaging_size: item.packaging_size,
                    quantity,
                    unit_price: unitPrice
                });
            }

            totalAmount += quantity * unitPrice;
        }

        totalAmount = Number(totalAmount.toFixed(2));

        if (amountPaid > totalAmount) {
            throw httpError(400, 'Amount paid cannot be greater than the sale total');
        }

        if (
            payload.payment_method !== 'CREDIT' &&
            Number(amountPaid.toFixed(2)) !== totalAmount
        ) {
            throw httpError(400, 'Cash and mobile money sales must be paid in full');
        }

        const paymentStatus = getPaymentStatus(totalAmount, amountPaid);
        const items = Array.from(aggregatedItems.values());

        for (const item of items) {
            const [stockRows] = await connection.query(
                `SELECT stock_id, available_quantity
                 FROM stock
                 WHERE fruit_id = ? AND packaging_size = ?
                 FOR UPDATE`,
                [item.fruit_id, item.packaging_size]
            );

            if (
                !stockRows.length ||
                Number(stockRows[0].available_quantity) < item.quantity
            ) {
                throw httpError(
                    400,
                    `Insufficient stock for fruit ${item.fruit_id} (${item.packaging_size}). Requested ${item.quantity}, available ${
                        stockRows.length ? stockRows[0].available_quantity : 0
                    }.`
                );
            }
        }

        const [saleResult] = await connection.query(
            `INSERT INTO sales
             (vendor_id, sale_date, payment_method, payment_status,
              total_amount, amount_paid)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                payload.vendor_id,
                payload.sale_date,
                payload.payment_method,
                paymentStatus,
                totalAmount,
                amountPaid
            ]
        );

        const saleId = saleResult.insertId;

        for (const item of items) {
            await connection.query(
                `INSERT INTO sales_details
                 (sale_id, fruit_id, packaging_size, quantity, unit_price)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    saleId,
                    item.fruit_id,
                    item.packaging_size,
                    item.quantity,
                    item.unit_price
                ]
            );

            const [updateResult] = await connection.query(
                `UPDATE stock
                 SET available_quantity = available_quantity - ?
                 WHERE fruit_id = ?
                   AND packaging_size = ?
                   AND available_quantity >= ?`,
                [
                    item.quantity,
                    item.fruit_id,
                    item.packaging_size,
                    item.quantity
                ]
            );

            if (updateResult.affectedRows !== 1) {
                throw httpError(
                    400,
                    `Stock changed while processing fruit ${item.fruit_id} (${item.packaging_size})`
                );
            }
        }

        if (amountPaid > 0) {
            await connection.query(
                `INSERT INTO payments (sale_id, payment_date, payment_method, amount)
                 VALUES (?, ?, ?, ?)`,
                [
                    saleId,
                    payload.sale_date,
                    payload.payment_method,
                    amountPaid
                ]
            );
        }

        await connection.query('COMMIT');
        transactionStarted = false;

        return {
            saleId,
            totalAmount,
            amountPaid,
            outstandingBalance: Number((totalAmount - amountPaid).toFixed(2)),
            paymentStatus
        };
    } catch (error) {
        if (transactionStarted) {
            await connection.query('ROLLBACK');
        }
        throw error;
    } finally {
        connection.release();
    }
};

const recordPayment = async (saleId, payload) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        await connection.query('BEGIN');
        transactionStarted = true;

        const [sales] = await connection.query(
            `SELECT total_amount, amount_paid
             FROM sales
             WHERE sale_id = ?
             FOR UPDATE`,
            [saleId]
        );

        if (!sales.length) {
            throw httpError(404, 'Sale not found');
        }

        const sale = sales[0];
        const balance = Number(
            (Number(sale.total_amount) - Number(sale.amount_paid)).toFixed(2)
        );
        const amount = Number(payload.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            throw httpError(400, 'Payment amount must be greater than zero');
        }

        if (amount > balance) {
            throw httpError(400, `Payment cannot exceed the outstanding balance of ${balance}`);
        }

        await connection.query(
            `INSERT INTO payments (sale_id, payment_date, payment_method, amount)
             VALUES (?, ?, ?, ?)`,
            [
                saleId,
                payload.payment_date,
                payload.payment_method,
                amount
            ]
        );

        const newAmountPaid = Number(
            (Number(sale.amount_paid) + amount).toFixed(2)
        );
        const paymentStatus = getPaymentStatus(sale.total_amount, newAmountPaid);

        await connection.query(
            `UPDATE sales
             SET amount_paid = ?, payment_status = ?
             WHERE sale_id = ?`,
            [newAmountPaid, paymentStatus, saleId]
        );

        await connection.query('COMMIT');
        transactionStarted = false;

        return {
            sale_id: Number(saleId),
            amount_paid: newAmountPaid,
            outstanding_balance: Number(
                (Number(sale.total_amount) - newAmountPaid).toFixed(2)
            ),
            payment_status: paymentStatus
        };
    } catch (error) {
        if (transactionStarted) {
            await connection.query('ROLLBACK');
        }
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getSales,
    getSaleById,
    createSale,
    recordPayment
};
