const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', authenticateAdmin, userController.getUsers);

router.get('/:id', authenticateAdmin, userController.getUserById);
router.put('/:id', authenticateAdmin, userController.updateUser);

module.exports = router;