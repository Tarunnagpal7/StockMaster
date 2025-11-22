const express = require('express');
const { getProducts, createProduct, updateProduct, getProduct, deleteProduct, getProductStock } = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getProducts);
router.get('/:id', authenticateToken, getProduct);
router.post('/', authenticateToken, createProduct);
router.delete('/:id', authenticateToken, deleteProduct);
router.get('/:id/stock', authenticateToken, getProductStock);

module.exports = router;
