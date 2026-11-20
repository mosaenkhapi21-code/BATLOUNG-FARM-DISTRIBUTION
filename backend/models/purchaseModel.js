const { db } = require('../config/db');
const { PACKAGING_SIZES } = require('../config/constants');
const { httpError } = require('../utils/httpError');

const getPurchases = async () => {
    const [rows] = await db.query(
        `SELECT p.*, s.business_name,
                COUNT(pd.purchase_detail_id) AS items
         FROM purchases p
         JOIN suppliers s ON p.supplier_id = s.supplier_id
         LEFT JOIN purchase_details pd ON p.purchase_id = pd.purchase_id
         GROUP BY p.purchase_id, s.business_name
         ORDER BY p.purchase_id DESC`
    );
    return rows;
};

const getPurchaseById = async (purchaseId) => {
    const [purchases] = await db.query(
        `SELECT p.*, s.business_name,
                COUNT(pd.purchase_detail_id) AS items
         FROM purchases p
         JOIN suppliers s ON p.supplier_id = s.supplier_id
         LEFT JOIN purchase_details pd ON p.purchase_id = pd.purchase_id
         WHERE p.purchase_id = ?
         GROUP BY p.purchase_id, s.business_name`,
        [purchaseId]
    );

    if (!purchases.length) {
        return null;
    }

    const [items] = await db.query(
        `SELECT pd.*, f.fruit_name
         FROM purchase_details pd
         JOIN fruits f ON pd.fruit_id = f.fruit_id
         WHERE pd.purchase_id = ?
         ORDER BY pd.purchase_detail_id`,
        [purchaseId]
    );

    return { ...purchases[0], items: purchases[0].items, details: items };
};

const createPurchase = async (payload) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        await connection.query('BEGIN');
        transactionStarted = true;

        const [suppliers] = await connection.query(
            'SELECT supplier_id FROM suppliers WHERE supplier_id = ?',
            [payload.supplier_id]
        );

        if (!suppliers.length) {
            throw httpError(404, 'Supplier not found');
        }

        let totalAmount = 0;
        const normalizedItems = [];

        for (const item of payload.items) {
            const quantity = Number(item.quantity);
            const unitCost = Number(item.unit_cost);

            if (
                !PACKAGING_SIZES.includes(item.packaging_size) ||
                !Number.isInteger(quantity) ||
                quantity <= 0 ||
                !Number.isFinite(unitCost) ||
                unitCost <= 0
            ) {
                throw httpError(400, 'Invalid purchase item details');
            }

            const [fruits] = await connection.query(
                `SELECT fruit_id FROM fruits
                 WHERE fruit_id = ? AND status = 'ACTIVE'`,
                [item.fruit_id]
            );

            if (!fruits.length) {
                throw httpError(400, `Active fruit ${item.fruit_id} was not found`);
            }

            const lineTotal = quantity * unitCost;
            totalAmount += lineTotal;
            normalizedItems.push({
                fruit_id: Number(item.fruit_id),
                quantity,
                unit_cost: unitCost,
                packaging_size: item.packaging_size
            });
        }

        totalAmount = Number(totalAmount.toFixed(2));

        const [purchaseResult] = await connection.query(
            `INSERT INTO purchases (supplier_id, purchase_date, total_amount)
             VALUES (?, ?, ?)`,
            [payload.supplier_id, payload.purchase_date, totalAmount]
        );

        const purchaseId = purchaseResult.insertId;

        for (const item of normalizedItems) {
            await connection.query(
                `INSERT INTO purchase_details
                 (purchase_id, fruit_id, quantity, unit_cost, packaging_size)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    purchaseId,
                    item.fruit_id,
                    item.quantity,
                    item.unit_cost,
                    item.packaging_size
                ]
            );

            const [stockRows] = await connection.query(
                `SELECT stock_id FROM stock
                 WHERE fruit_id = ? AND packaging_size = ?
                 FOR UPDATE`,
                [item.fruit_id, item.packaging_size]
            );

            if (stockRows.length) {
                await connection.query(
                    `UPDATE stock
                     SET available_quantity = available_quantity + ?
                     WHERE stock_id = ?`,
                    [item.quantity, stockRows[0].stock_id]
                );
            } else {
                await connection.query(
                    `INSERT INTO stock
                     (fruit_id, packaging_size, available_quantity)
                     VALUES (?, ?, ?)`,
                    [item.fruit_id, item.packaging_size, item.quantity]
                );
            }
        }

        await connection.query('COMMIT');
        transactionStarted = false;

        return { purchaseId, totalAmount };
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
    getPurchases,
    getPurchaseById,
    createPurchase
};
