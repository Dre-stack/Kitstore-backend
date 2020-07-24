const express = require('express');

const {
  protectRoute,
  retstrictRoute,
} = require('../controllers/authController');

const {
  createNewProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductsPhoto,
  resizeProductImages,
  addToCart,
  testProducts,
} = require('../controllers/productsController');

const router = express.Router();

router.route('/').post(getAllProducts);
router.route('/new').post(
  protectRoute,
  retstrictRoute('admin'),
  // testProducts
  uploadProductsPhoto,
  resizeProductImages,
  createNewProduct
);
router
  .route('/:id')
  .get(getProduct)
  .patch(
    protectRoute,
    retstrictRoute('admin'),
    uploadProductsPhoto,
    resizeProductImages,
    updateProduct
  )
  .delete(protectRoute, retstrictRoute('admin'), deleteProduct);
router
  .route('/addtocart')
  .post(protectRoute, retstrictRoute('admin'), addToCart);

module.exports = router;
