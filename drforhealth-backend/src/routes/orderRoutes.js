const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, ctrl.createOrder);
router.post('/verify', protect, ctrl.verifyPayment);
router.get('/my-orders', protect, ctrl.getMyOrders);

// Webhook is registered separately in server.js with raw body parsing
module.exports = router;
