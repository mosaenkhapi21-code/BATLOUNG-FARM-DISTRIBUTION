const saleModel = require('../models/saleModel');
const asyncHandler = require('../middleware/asyncHandler');

exports.getSales = asyncHandler(async (req, res) => {
    res.status(200).json(await saleModel.getSales());
});

exports.getSale = asyncHandler(async (req, res) => {
    const sale = await saleModel.getSaleById(req.params.id);

    if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json(sale);
});

exports.createSale = asyncHandler(async (req, res) => {
    const result = await saleModel.createSale(req.body);

    res.status(201).json({
        message: 'Sale recorded and stock updated successfully',
        sale_id: result.saleId,
        total_amount: result.totalAmount,
        amount_paid: result.amountPaid,
        outstanding_balance: result.outstandingBalance,
        payment_status: result.paymentStatus
    });
});

exports.recordPayment = asyncHandler(async (req, res) => {
    const payload = {
        ...req.body,
        payment_date: req.body.payment_date || new Date().toISOString().slice(0, 10)
    };

    const result = await saleModel.recordPayment(req.params.id, payload);

    res.status(201).json({
        message: 'Payment recorded successfully',
        ...result
    });
});
