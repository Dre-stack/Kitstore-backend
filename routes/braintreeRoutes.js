const express = require('express');
const { protectRoute } = require('../controllers/authController');
const {
  generateToken,
  processPayment,
} = require('../controllers/braintreeController');

const router = express.Router();

router.route('/gettoken').get(protectRoute, generateToken);
router.route('/pay').post(protectRoute, processPayment);

module.exports = router;
