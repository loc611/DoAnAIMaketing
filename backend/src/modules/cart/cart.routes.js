const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// Protect all cart routes with authMiddleware
router.use(authenticateToken);

router.get('/', cartController.getCart);
router.put('/', cartController.syncCart);

module.exports = router;
