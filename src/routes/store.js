const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateAdmin, authenticateCustomer } = require('../middleware/auth');

router.post('/', authenticateAdmin, storeController.createStore);
router.get('/', storeController.getAllStores);
router.get('/nearby', authenticateCustomer, storeController.getNearbyStores);
router.get('/:id', storeController.getStoreById);

module.exports = router;