
const Supplier = require('../model/supplierModel');

const getAllSuppliers = async () => {
    const [rows] = await db.query(
        'SELECT * FROM suppliers ORDER BY supplier_id DESC'
    );
    return rows;
};

const getSupplierById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM suppliers WHERE supplier_id = ?',
        [id]
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

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier
};
