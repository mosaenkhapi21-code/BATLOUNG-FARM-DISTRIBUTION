const { db } = require('../config/db');

const fruitColumns = `
    f.fruit_id,
    f.fruit_name,
    f.description,
    f.status,
    MAX(CASE WHEN fp.packaging_size = 'SMALL' THEN fp.unit_price END) AS small_price,
    MAX(CASE WHEN fp.packaging_size = 'MEDIUM' THEN fp.unit_price END) AS medium_price,
    MAX(CASE WHEN fp.packaging_size = 'LARGE' THEN fp.unit_price END) AS large_price
`;

const fruitGroup = `
    GROUP BY f.fruit_id, f.fruit_name, f.description, f.status
`;

const getAllFruits = async (status) => {
    const params = [];
    let where = '';

    if (status) {
        where = 'WHERE f.status = ?';
        params.push(status);
    }

    const [rows] = await db.query(
        `SELECT ${fruitColumns}
         FROM fruits f
         LEFT JOIN fruit_prices fp ON f.fruit_id = fp.fruit_id
         ${where}
         ${fruitGroup}
         ORDER BY f.fruit_id`,
        params
    );

    return rows;
};

const getFruitById = async (fruitId) => {
    const [rows] = await db.query(
        `SELECT ${fruitColumns}
         FROM fruits f
         LEFT JOIN fruit_prices fp ON f.fruit_id = fp.fruit_id
         WHERE f.fruit_id = ?
         ${fruitGroup}`,
        [fruitId]
    );

    return rows[0];
};

const createFruit = async (fruit) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        await connection.query('BEGIN');
        transactionStarted = true;

        const [result] = await connection.query(
            `INSERT INTO fruits (fruit_name, description, status)
             VALUES (?, ?, ?)`,
            [
                fruit.fruit_name,
                fruit.description || null,
                fruit.status || 'ACTIVE'
            ]
        );

        const fruitId = result.insertId;

        for (const [packagingSize, field] of [
            ['SMALL', 'small_price'],
            ['MEDIUM', 'medium_price'],
            ['LARGE', 'large_price']
        ]) {
            await connection.query(
                `INSERT INTO fruit_prices (fruit_id, packaging_size, unit_price)
                 VALUES (?, ?, ?)`,
                [fruitId, packagingSize, Number(fruit[field])]
            );
        }

        await connection.query('COMMIT');
        transactionStarted = false;

        return fruitId;
    } catch (error) {
        if (transactionStarted) {
            await connection.query('ROLLBACK');
        }
        throw error;
    } finally {
        connection.release();
    }
};

const updateFruit = async (fruitId, fruit) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        await connection.query('BEGIN');
        transactionStarted = true;

        const [existing] = await connection.query(
            'SELECT fruit_id FROM fruits WHERE fruit_id = ?',
            [fruitId]
        );

        if (!existing.length) {
            await connection.query('ROLLBACK');
            transactionStarted = false;
            return null;
        }

        await connection.query(
            `UPDATE fruits
             SET fruit_name = ?, description = ?, status = ?
             WHERE fruit_id = ?`,
            [
                fruit.fruit_name,
                fruit.description || null,
                fruit.status || 'ACTIVE',
                fruitId
            ]
        );

        for (const [packagingSize, field] of [
            ['SMALL', 'small_price'],
            ['MEDIUM', 'medium_price'],
            ['LARGE', 'large_price']
        ]) {
            await connection.query(
                `INSERT INTO fruit_prices (fruit_id, packaging_size, unit_price)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE unit_price = VALUES(unit_price)`,
                [fruitId, packagingSize, Number(fruit[field])]
            );
        }

        await connection.query('COMMIT');
        transactionStarted = false;

        return getFruitById(fruitId);
    } catch (error) {
        if (transactionStarted) {
            await connection.query('ROLLBACK');
        }
        throw error;
    } finally {
        connection.release();
    }
};

const deleteFruit = async (fruitId) => {
    const [result] = await db.query(
        'DELETE FROM fruits WHERE fruit_id = ?',
        [fruitId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    getAllFruits,
    getFruitById,
    createFruit,
    updateFruit,
    deleteFruit
};
