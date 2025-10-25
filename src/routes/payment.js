const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateCustomer } = require('../middleware/auth');

router.post('/create-order', authenticateCustomer, paymentController.createRazorpayOrder);
router.post('/verify', authenticateCustomer, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/:orderId', authenticateCustomer, paymentController.getPaymentDetails);

module.exports = router;