const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateCustomer } = require('../middleware/auth');

router.post('/', authenticateCustomer, cartController.addToCart);
router.get('/', authenticateCustomer, cartController.getCart);
router.put('/:itemId', authenticateCustomer, cartController.updateCartItem);
router.delete('/:itemId', authenticateCustomer, cartController.removeFromCart);
router.delete('/', authenticateCustomer, cartController.clearCart);

module.exports = router;