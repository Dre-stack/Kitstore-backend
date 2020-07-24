const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const multer = require('multer');
const sharp = require('sharp');
const sgMail = require('@sendgrid/mail');

const User = require('../models/User');
const catchAsync = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.params.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
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

exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // 1) Cover image
  req.body.photo = `user-${req.params.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 60 })
    .toFile(`public/img/users/${req.body.photo}`);

  // 2) Images
  // req.body.photo = [];

  // await Promise.all(
  //   req.files.map(async (file, i) => {
  //     const filename = `product-${req.body.name}-${Date.now()}-${
  //       i + 1
  //     }.png`;

  //     await sharp(file.buffer)
  //       .resize(2000, 2000, {
  //         fit: 'cover',
  //         position: 'top',
  //       })
  //       .toFormat('png')
  //       .png()
  //       .toFile(`public/img/products/${filename}`);

  //     req.body.photo.push(filename);
  //   })
  // );

  next();
});

exports.uploadUserPhoto = upload.single('photo');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  newUser.password = undefined;
  const token = signToken(newUser._id);

  res.status(201).json({
    token,
  });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    next(new AppError('please enter your email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (
    !user ||
    !(await user.comparePassword(password, user.password))
  ) {
    return next(
      new AppError(
        'incorrect email or password please try again',
        401
      )
    );
  }
  const token = signToken(user._id);

  await User.findByIdAndUpdate(user._id, { isSignedOut: false });

  res.status(201).json({
    token,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(201).json({
    status: 'success',
    results: users.length,
    datat: {
      users,
    },
  });
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return next(
      new AppError(
        'You are not logged in, please log in to continue',
        401
      )
    );
  }
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return next(new AppError('user no longer exist', 401));
  }
  if (user.isSignedOut) {
    return next(
      new AppError(
        'user signed out, invalid token please sign in again',
        401
      )
    );
  }
  if (user.changedPasswordAfterTokenIssued(decodedToken.iat)) {
    return next(new AppError('user recently changed password', 401));
  }
  req.user = user;
  next();
});

exports.retstrictRoute = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have the permission to perform this request',
          403
        )
      );
    }
    next();
  };
};

exports.signout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isSignedOut: true });
  res.clearCookie('jwt', { httpOnly: true });
  res.status(201).json({
    isSignedIn: false,
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  const id = req.user._id;

  await User.findByIdAndUpdate(id, req.body);

  res.status(200).json({ status: 'success' });
});

exports.addNewAddress = catchAsync(async (req, res) => {
  const id = req.user._id;

  await User.updateOne({ _id: id }, { $push: { address: req.body } });

  res.status(200).json({ status: 'success' });
});

exports.handleForgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('No User With That Email Address', 400));

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://localhost:3000/user/reset-password/${token}`;

  const msg = {
    to: user.email,
    from: 'damiflo94@gmail.com',
    subject: 'Forgot Your Password?',
    text: 'forgot your email??',
    html: `<div>${resetUrl}</div>`,
  };
  try {
    await sgMail.send(msg);
  } catch (err) {
    console.log(err);
  }
  res.status(201).json({ status: 'success' });
});
exports.resetUserPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    prt: hashedToken,
    prtExpires: {
      $gt: Date.now(),
    },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(
      new AppError(
        'Your Token is invalid or Token has expired, Please Try Again',
        400
      )
    );
  }
  console.log(req.body);
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.prt = undefined;
  user.prtExpires = undefined;
  await user.save();
  const jwt = signToken(user._id);

  res.status(201).json({ jwt });
});

exports.updateUserPassword = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // 1) Get user from collection
  const user = await User.findById(req.user._id).select('+password');

  // 2) Check if POSTed current password is correct
  if (
    !(await user.comparePassword(
      req.body.currentPassword,
      user.password
    ))
  ) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  res.status(201).json({ status: 'success' });
});
