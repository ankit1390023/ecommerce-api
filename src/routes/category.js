const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

module.exports = router;