const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temporary_jwt_secret_dev_fallback_key');
      req.user = decoded;
    } catch (e) {
      // ignore token error in optional auth
    }
  }
  next();
};

router.get('/', reviewController.getReviewsByProduct);
router.post('/', optionalAuth, reviewController.createReview);

module.exports = router;
