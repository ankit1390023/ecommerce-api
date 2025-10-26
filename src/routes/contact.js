const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin, contactController.sendMessageToSuperAdmin);

module.exports = router;