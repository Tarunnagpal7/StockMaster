const express = require('express');
const { getUsers, getUser, updateUser } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUser);
router.put('/:id', authenticateToken, updateUser);

module.exports = router;
