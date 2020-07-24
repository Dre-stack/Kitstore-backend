const express = require('express');

const {
  protectRoute,
  retstrictRoute,
} = require('../controllers/authController');
const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoriesController');

const router = express.Router();

router.route('/').get(getAllCategories);
router
  .route('/new')
  .post(protectRoute, retstrictRoute('admin'), createCategory);
router
  .route('/:id')
  .get(getCategory)
  .patch(protectRoute, retstrictRoute('admin'), updateCategory)
  .delete(protectRoute, retstrictRoute('admin'), deleteCategory);

module.exports = router;
