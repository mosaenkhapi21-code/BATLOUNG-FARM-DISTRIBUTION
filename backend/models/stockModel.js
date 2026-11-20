const { db } = require('../config/db');

const stockSelect = `
    SELECT st.stock_id, st.fruit_id, f.fruit_name,
           st.packaging_size, st.available_quantity
    FROM stock st
    JOIN fruits f ON st.fruit_id = f.fruit_id
`;

const getAllStock = async () => {
    const [rows] = await db.query(
        `${stockSelect}
         ORDER BY f.fruit_name,
                  FIELD(st.packaging_size, 'SMALL', 'MEDIUM', 'LARGE')`
    );
    return rows;
};

const getStockByFruit = async (fruitId) => {
    const [rows] = await db.query(
        `${stockSelect}
         WHERE st.fruit_id = ?
         ORDER BY FIELD(st.packaging_size, 'SMALL', 'MEDIUM', 'LARGE')`,
        [fruitId]
    );
    return rows;
};

const getLowStock = async (threshold) => {
    const [rows] = await db.query(
        `${stockSelect}
         WHERE st.available_quantity <= ?
         ORDER BY st.available_quantity ASC, f.fruit_name`,
        [threshold]
    );
    return rows;
};

const updateStockQuantity = async (stockId, quantity) => {
    const [result] = await db.query(
        `UPDATE stock
         SET available_quantity = ?
         WHERE stock_id = ?`,
        [quantity, stockId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    getAllStock,
    getStockByFruit,
    getLowStock,
    updateStockQuantity
};
