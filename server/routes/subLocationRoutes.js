const express = require('express');
const { getSubLocations, createSubLocation, deleteSubLocation } = require('../controllers/subLocationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getSubLocations);
router.post('/', authenticateToken, createSubLocation);
router.delete('/:id', authenticateToken, deleteSubLocation);

module.exports = router;
