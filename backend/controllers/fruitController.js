const fruitModel = require('../models/fruitModel');
const asyncHandler = require('../middleware/asyncHandler');

exports.getFruits = asyncHandler(async (req, res) => {
    const status = req.query.status;

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
        return res.status(400).json({ message: 'Invalid fruit status filter' });
    }

    res.status(200).json(await fruitModel.getAllFruits(status));
});

exports.getAvailableFruits = asyncHandler(async (req, res) => {
    res.status(200).json(await fruitModel.getAllFruits('ACTIVE'));
});

exports.getFruit = asyncHandler(async (req, res) => {
    const fruit = await fruitModel.getFruitById(req.params.id);

    if (!fruit) {
        return res.status(404).json({ message: 'Fruit not found' });
    }

    res.status(200).json(fruit);
});

exports.createFruit = asyncHandler(async (req, res) => {
    const fruitId = await fruitModel.createFruit(req.body);
    const fruit = await fruitModel.getFruitById(fruitId);

    res.status(201).json({
        message: 'Fruit created successfully',
        fruit_id: fruitId,
        fruit
    });
});

exports.updateFruit = asyncHandler(async (req, res) => {
    const fruit = await fruitModel.updateFruit(req.params.id, req.body);

    if (!fruit) {
        return res.status(404).json({ message: 'Fruit not found' });
    }

    res.status(200).json({
        message: 'Fruit updated successfully',
        fruit
    });
});

exports.deleteFruit = asyncHandler(async (req, res) => {
    const deleted = await fruitModel.deleteFruit(req.params.id);

    if (!deleted) {
        return res.status(404).json({ message: 'Fruit not found' });
    }

    res.status(200).json({ message: 'Fruit deleted successfully' });
});
