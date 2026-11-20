const { db } = require('../config/db');

const getAllSuppliers = async () => {
    const [rows] = await db.query(
        'SELECT * FROM suppliers ORDER BY supplier_id DESC'
    );
    return rows;
};

const getSupplierById = async (supplierId) => {
    const [rows] = await db.query(
        'SELECT * FROM suppliers WHERE supplier_id = ?',
        [supplierId]
    );
    return rows[0];
};

const createSupplier = async (supplier) => {
    const { business_name, contact_person, phone, province, address } = supplier;

    const [result] = await db.query(
        `INSERT INTO suppliers
         (business_name, contact_person, phone, province, address)
         VALUES (?, ?, ?, ?, ?)`,
        [business_name, contact_person, phone, province, address]
    );

    return result.insertId;
};

const updateSupplier = async (supplierId, supplier) => {
    const { business_name, contact_person, phone, province, address } = supplier;

    await db.query(
        `UPDATE suppliers
         SET business_name = ?, contact_person = ?, phone = ?,
             province = ?, address = ?
         WHERE supplier_id = ?`,
        [business_name, contact_person, phone, province, address, supplierId]
    );

    return getSupplierById(supplierId);
};

const deleteSupplier = async (supplierId) => {
    const [result] = await db.query(
        'DELETE FROM suppliers WHERE supplier_id = ?',
        [supplierId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
