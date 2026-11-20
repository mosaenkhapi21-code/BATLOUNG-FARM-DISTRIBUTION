const { db } = require('../config/db');

const vendorSelect = `
    SELECT v.*,
           COALESCE(SUM(s.total_amount - s.amount_paid), 0) AS outstanding_balance
    FROM vendors v
    LEFT JOIN sales s ON v.vendor_id = s.vendor_id
`;

const vendorGroup = 'GROUP BY v.vendor_id, v.vendor_name, v.phone_number, v.location, v.registration_date, v.created_at';

const getAllVendors = async () => {
    const [rows] = await db.query(
        `${vendorSelect} ${vendorGroup} ORDER BY v.vendor_id DESC`
    );
    return rows;
};

const getVendorById = async (vendorId) => {
    const [rows] = await db.query(
        `${vendorSelect} WHERE v.vendor_id = ? ${vendorGroup}`,
        [vendorId]
    );
    return rows[0];
};

const searchVendors = async (searchTerm) => {
    const search = `%${searchTerm}%`;
    const [rows] = await db.query(
        `${vendorSelect}
         WHERE v.vendor_name LIKE ? OR v.phone_number LIKE ? OR v.location LIKE ?
         ${vendorGroup}
         ORDER BY v.vendor_name`,
        [search, search, search]
    );
    return rows;
};

const createVendor = async (vendor) => {
    const { vendor_name, phone_number, location, registration_date } = vendor;
    const [result] = await db.query(
        `INSERT INTO vendors
         (vendor_name, phone_number, location, registration_date)
         VALUES (?, ?, ?, ?)`,
        [vendor_name, phone_number, location, registration_date]
    );
    return result.insertId;
};

const updateVendor = async (vendorId, vendor) => {
    const { vendor_name, phone_number, location } = vendor;

    await db.query(
        `UPDATE vendors
         SET vendor_name = ?, phone_number = ?, location = ?
         WHERE vendor_id = ?`,
        [vendor_name, phone_number, location, vendorId]
    );

    return getVendorById(vendorId);
};

const deleteVendor = async (vendorId) => {
    const [result] = await db.query(
        'DELETE FROM vendors WHERE vendor_id = ?',
        [vendorId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    getAllVendors,
    getVendorById,
    searchVendors,
    createVendor,
    updateVendor,
    deleteVendor
};
