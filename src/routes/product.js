const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authenticateAdmin, upload.array('images', 5), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.post('/:productId/stores', authenticateAdmin, productController.linkProductToStores);

module.exports = router;