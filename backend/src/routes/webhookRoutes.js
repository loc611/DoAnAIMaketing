const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Route nhận webhook
router.post('/sepay', webhookController.handleSepayWebhook);

module.exports = router;
