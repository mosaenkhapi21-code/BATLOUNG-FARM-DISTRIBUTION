
const express = require('express');
const router = express.Router();
const fruitController = require('../controllers/fruitController');

router.get('/', fruitController.getFruits);
router.get('/:id', fruitController.getFruit);
router.post('/', fruitController.createFruit);
router.put('/:id', fruitController.updateFruit);

module.exports = router;
