const supplierModel = require('../models/SupplierModel');
const asyncHandler = require('../middleware/asyncHandler');

exports.getSuppliers = asyncHandler(async (req, res) => {
    res.status(200).json(await supplierModel.getAllSuppliers());
});

exports.getSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierModel.getSupplierById(req.params.id);

    if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json(supplier);
});

exports.createSupplier = asyncHandler(async (req, res) => {
    const supplierId = await supplierModel.createSupplier(req.body);
    const supplier = await supplierModel.getSupplierById(supplierId);

    res.status(201).json({
        message: 'Supplier created successfully',
        supplier_id: supplierId,
        supplier
    });
});

exports.updateSupplier = asyncHandler(async (req, res) => {
    const existing = await supplierModel.getSupplierById(req.params.id);

    if (!existing) {
        return res.status(404).json({ message: 'Supplier not found' });
    }

    const supplier = await supplierModel.updateSupplier(req.params.id, req.body);

    res.status(200).json({
        message: 'Supplier updated successfully',
        supplier
    });
});

exports.deleteSupplier = asyncHandler(async (req, res) => {
    const deleted = await supplierModel.deleteSupplier(req.params.id);

    if (!deleted) {
        return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier deleted successfully' });
});
