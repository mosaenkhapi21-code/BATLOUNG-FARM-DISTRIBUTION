const purchaseModel = require('../models/purchaseModel');
const asyncHandler = require('../middleware/asyncHandler');

exports.getPurchases = asyncHandler(async (req, res) => {
    res.status(200).json(await purchaseModel.getPurchases());
});

exports.getPurchase = asyncHandler(async (req, res) => {
    const purchase = await purchaseModel.getPurchaseById(req.params.id);

    if (!purchase) {
        return res.status(404).json({ message: 'Purchase not found' });
    }

    res.status(200).json(purchase);
});

exports.createPurchase = asyncHandler(async (req, res) => {
    const result = await purchaseModel.createPurchase(req.body);

    res.status(201).json({
        message: 'Purchase recorded and stock updated successfully',
        purchase_id: result.purchaseId,
        total_amount: result.totalAmount
    });
});
