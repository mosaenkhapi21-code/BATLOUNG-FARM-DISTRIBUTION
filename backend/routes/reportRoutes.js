
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/top-fruits', reportController.getTopFiveFruits);
router.get('/sales-revenue', reportController.getSalesRevenue);
router.get('/top-vendor', reportController.getTopVendor);
router.get('/stock', reportController.getStockReport);

module.exports = router;
