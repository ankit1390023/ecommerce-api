const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateCustomer } = require('../middleware/auth');

router.get('/profile', authenticateCustomer, customerController.getProfile);
router.post('/address', authenticateCustomer, customerController.addAddress);
router.put('/address/:addressId', authenticateCustomer, customerController.updateAddress);

module.exports = router;