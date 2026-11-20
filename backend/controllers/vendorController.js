const vendorModel = require('../models/vendorModel');
const asyncHandler = require('../middleware/asyncHandler');

exports.getVendors = asyncHandler(async (req, res) => {
    res.status(200).json(await vendorModel.getAllVendors());
});

exports.getVendor = asyncHandler(async (req, res) => {
    const vendor = await vendorModel.getVendorById(req.params.id);

    if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json(vendor);
});

exports.searchVendors = asyncHandler(async (req, res) => {
    const searchTerm = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    res.status(200).json(await vendorModel.searchVendors(searchTerm));
});

exports.createVendor = asyncHandler(async (req, res) => {
    const payload = {
        ...req.body,
        registration_date: req.body.registration_date || new Date().toISOString().slice(0, 10)
    };

    const vendorId = await vendorModel.createVendor(payload);
    const vendor = await vendorModel.getVendorById(vendorId);

    res.status(201).json({
        message: 'Vendor created successfully',
        vendor_id: vendorId,
        vendor
    });
});

exports.updateVendor = asyncHandler(async (req, res) => {
    const existing = await vendorModel.getVendorById(req.params.id);

    if (!existing) {
        return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendor = await vendorModel.updateVendor(req.params.id, req.body);

    res.status(200).json({
        message: 'Vendor updated successfully',
        vendor
    });
});

exports.deleteVendor = asyncHandler(async (req, res) => {
    const deleted = await vendorModel.deleteVendor(req.params.id);

    if (!deleted) {
        return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({ message: 'Vendor deleted successfully' });
});
