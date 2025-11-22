const express = require('express');
const {
    createTransaction,
    getTransactions,
    validateTransaction,
    createIn,
    createOut,
    createTransfer,
    createAdjust,
    updateStatus,
    getHistory
} = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getTransactions);
router.get('/history', authenticateToken, getHistory);
router.post('/', authenticateToken, createTransaction);
router.post('/in', authenticateToken, createIn);
router.post('/out', authenticateToken, createOut);
router.post('/transfer', authenticateToken, createTransfer);
router.post('/adjust', authenticateToken, createAdjust);
router.post('/:id/validate', authenticateToken, validateTransaction);
router.post('/:id/status', authenticateToken, updateStatus);

module.exports = router;
