const stockModel = require('../models/stockModel');
const asyncHandler = require('../middleware/asyncHandler');

exports.getStock = asyncHandler(async (req, res) => {
    res.status(200).json(await stockModel.getAllStock());
});

exports.getStockByFruit = asyncHandler(async (req, res) => {
    const stock = await stockModel.getStockByFruit(req.params.fruit_id);

    if (!stock.length) {
        return res.status(404).json({ message: 'No stock records found for this fruit' });
    }

    res.status(200).json(stock);
});

exports.getLowStock = asyncHandler(async (req, res) => {
    const threshold = Number(req.query.threshold ?? 10);

    res.status(200).json({
        threshold,
        low_stock_items: await stockModel.getLowStock(threshold)
    });
});

exports.updateStock = asyncHandler(async (req, res) => {
    const updated = await stockModel.updateStockQuantity(
        req.params.id,
        Number(req.body.available_quantity)
    );

    if (!updated) {
        return res.status(404).json({ message: 'Stock record not found' });
    }

    res.status(200).json({ message: 'Stock quantity updated successfully' });
});
