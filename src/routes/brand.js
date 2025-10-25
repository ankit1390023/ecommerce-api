const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin, brandController.createBrand);
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);

module.exports = router;