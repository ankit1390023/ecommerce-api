const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateCustomer } = require('../middleware/auth');

router.post('/', authenticateCustomer, orderController.createOrder);
router.get('/', authenticateCustomer, orderController.getOrders);
router.get('/:orderId', authenticateCustomer, orderController.getOrderById);
router.put('/:orderId/cancel', authenticateCustomer, orderController.cancelOrder);

module.exports = router;