
const express = require('express');
const router = express.Router();

const {
    getStock,
    getStockByFruit,
    getLowStock
} = require('../controllers/stockController');

router.get('/', getStock);
router.get('/low-stock', getLowStock);
router.get('/fruit/:fruit_id', getStockByFruit);

module.exports = router;
