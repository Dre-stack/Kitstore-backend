const express = require('express');
const {
  signup,
  signout,
  signin,
  getAllUsers,
  protectRoute,
  retstrictRoute,
  updateUser,
  uploadUserPhoto,
  resizeUserImage,
  addNewAddress,
  handleForgotPassword,
  resetUserPassword,
  updateUserPassword,
} = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(protectRoute, retstrictRoute('admin'), getAllUsers);
router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/signout').get(protectRoute, signout);
router.route('/me').get(protectRoute, (req, res) =>
  res.status(201).json({
    status: 'success',
    user: req.user,
  })
);
router.post('/forgot-password', handleForgotPassword);
router.post('/change-password', protectRoute, updateUserPassword);
router.post('/reset-password/:token', resetUserPassword);
router.post('/new-address', protectRoute, addNewAddress);
router
  .route('/:id')
  .patch(protectRoute, uploadUserPhoto, resizeUserImage, updateUser);

module.exports = router;
