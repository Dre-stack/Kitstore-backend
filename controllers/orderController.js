const { Order } = require('../models/Order');
// const User = require('../models/User');
const catchAsync = require('../utils/catchAsyncErrors');
const Email = require('../utils/Email');

exports.createOrder = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  const newOrder = await Order.create(req.body);
  // console.log(newOrder);

  ///send new order email to user
  url = `${req.protocol}://${req.get('host')}/user/purchase-history`;
  const email = new Email(req.user, url);
  try {
    await email.sendNewOrder(newOrder);
  } catch (err) {
    console.log(err);
  }
  ////response
  res.status(200).send('success');
});

exports.getUserOrderHistory = catchAsync(async (req, res) => {
  const id = req.user._id;

  const orderhistory = await Order.find({ user: id }).sort(
    '-createdAt'
  );
  res.status(201).json(orderhistory);
});

exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find().sort('-createdAt');
  res.status(201).json({ orders });
});

exports.getOrderStatusValues = catchAsync(async (req, res) => {
  res.json(Order.schema.path('status').enumValues);
});

exports.UpdateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByIdAndUpdate(
    id,
    {
      $set: { status: req.body.status },
    },
    { new: true }
  );
  res.status(201).json({ order });
});
