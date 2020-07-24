const Category = require('../models/Categories');
const catchAsync = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find().select('name _id');
  res.status(201).json({
    categories,
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newCategory,
    },
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate('products');

  if (!category) {
    return next(
      new AppError('invalid category please try again', 400)
    );
  }
  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id).populate(
    'products'
  );
  if (!category) {
    return next(
      new AppError('invalid category please try again', 400)
    );
  }
  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return next(
      new AppError('invalid category please try again', 400)
    );
  }
  res.status(204).json({
    status: 'success',
  });
});
