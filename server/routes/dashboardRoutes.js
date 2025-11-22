const express = require('express');
const { getDashboardStats, getDashboardGraphData } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getDashboardStats);
router.get('/graph', authenticateToken, getDashboardGraphData);

module.exports = router;
