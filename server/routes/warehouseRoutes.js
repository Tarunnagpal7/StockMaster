const express = require('express');
const { getWarehouses, createWarehouse } = require('../controllers/warehouseController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getWarehouses);
router.post('/', authenticateToken, createWarehouse);

module.exports = router;
