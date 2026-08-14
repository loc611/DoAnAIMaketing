const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');

// POST /api/chat
router.post('/', chatController.handleChatMsg);

module.exports = router;
