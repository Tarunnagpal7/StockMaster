const express = require('express');
const { getDashboardStats, getDashboardGraphData, getDashboardPieChartData } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getDashboardStats);
router.get('/graph', authenticateToken, getDashboardGraphData);
router.get('/pie-chart', authenticateToken, getDashboardPieChartData);

module.exports = router;
