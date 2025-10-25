const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin routes
router.post('/admin/register', authController.registerAdmin);
router.post('/admin/login', authController.loginAdmin);

// Customer routes
router.post('/customer/register', authController.registerCustomer);
router.post('/customer/login', authController.loginCustomer);

module.exports = router;