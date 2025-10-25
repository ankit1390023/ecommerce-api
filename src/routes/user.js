const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', authenticateAdmin, userController.getUsers);
router.post('/', authenticateAdmin, userController.createUser);
router.get('/:id', authenticateAdmin, userController.getUserById);
router.put('/:id', authenticateAdmin, userController.updateUser);
router.delete('/:id', authenticateAdmin, userController.deleteUser);

module.exports = router;