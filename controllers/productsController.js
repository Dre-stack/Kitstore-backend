const multer = require('multer');
const sharp = require('sharp');
const Product = require('../models/Products');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');
const BuildQuery = require('../utils/BuildQuery');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public/img/products');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `product-${req.body.name}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('only images allowed', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.resizeProductImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files) return next();

  // // 1) Cover image
  // req.body.imageCover = `tour-${
  //   req.params.id
  // }-${Date.now()}-cover.jpeg`;
  // await sharp(req.files.imageCover[0].buffer)
  //   .resize(2000, 1333)
  //   .toFormat('jpeg')
  //   .jpeg({ quality: 90 })
  //   .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.photo = [];

  await Promise.all(
    req.files.map(async (file, i) => {
      const filename = `product-${req.user._id}-${Date.now()}-${
        i + 1
      }.png`;

      await sharp(file.buffer)
        .resize(2000, 2000, {
          fit: 'cover',
          position: 'top',
        })
        .toFormat('png')
        .png()
        .toFile(`public/img/products/${filename}`);

      req.body.photo.push(filename);
    })
  );

  next();
});

exports.uploadProductsPhoto = upload.array('photo', 3);

exports.createNewProduct = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  // if (req.files) {
  //   req.body.photo = req.files.map((el) => el.filename);
  // }
  // console.log(req.files, req.body.photo);
  // res.json(req.body.photo);
  if (req.body.photo.length < 1) {
    return next(
      new AppError(
        'No images uploaded, add images and try again',
        400
      )
    );
  }
  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newProduct,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return next(
      new AppError('invalid product id please try again', 400)
    );
  }
  res.status(201).json({
    product,
  });
});
console;
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.status(204).json({
    status: 'success',
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // if (req.files) {
  //   req.body.photo = req.files.map((file) => file.filename);
  // }
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  let order = req.body.order ? req.body.order : 'desc';
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
  let limit = req.body.limit ? parseInt(req.body.limit) : 20;
  let skip = parseInt(req.body.skip);
  let findArgs = {};
  const { filters } = req.body;
  for (let key in filters) {
    if (filters[key].length > 0) {
      if (key === 'price') {
        findArgs[key] = {
          $gte: filters[key][0],
          $lte: filters[key][1],
        };
      } else {
        findArgs[key] = filters[key];
      }
    }
  }
  // console.log(findArgs);

  const products = await Product.find(findArgs)
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec();

  res.status(201).json({
    products,
    size: products.length,
  });
});

exports.addToCart = catchAsync(async (req, res) => {
  const id = req.user._id;
  // console.log(req.body);
  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.status(201).json({ cart: user.cart });
});

exports.updateQuantity = catchAsync(async (req, res, next) => {
  let bulkOptions = req.body.products.map((product) => {
    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $inc: {
            quantity: -product.quantity,
            sold: +product.quantity,
          },
        },
      },
    };
  });
  console.log(bulkOptions);
  await Product.bulkWrite(bulkOptions);

  next();
});
exports.testProducts = (req, res) => {
  res.json({ files: req.file, photos: req.body.photo });
};
