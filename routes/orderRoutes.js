const express = require('express');

const {
  protectRoute,
  retstrictRoute,
} = require('../controllers/authController');

const {
  createOrder,
  getUserOrderHistory,
  getAllOrders,
  getOrderStatusValues,
  UpdateOrderStatus,
} = require('../controllers/orderController');
const {
  updateQuantity,
} = require('../controllers/productsController');

const router = express.Router();

router
  .route('/')
  .get(protectRoute, retstrictRoute('admin'), getAllOrders);

router.get(
  '/status-values',
  protectRoute,
  retstrictRoute('admin'),
  getOrderStatusValues
);

router.patch(
  '/update-status/:id',
  protectRoute,
  retstrictRoute('admin'),
  UpdateOrderStatus
);
router
  .route('/create')
  .post(protectRoute, updateQuantity, createOrder);

router.route('/user').get(protectRoute, getUserOrderHistory);

module.exports = router;
