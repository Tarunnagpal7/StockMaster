const express = require('express');
const { getLocations, createLocation, updateLocation, deleteLocation } = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getLocations);
router.post('/', authenticateToken, createLocation);
router.put('/:id', authenticateToken, updateLocation);
router.delete('/:id', authenticateToken, deleteLocation);

module.exports = router;
