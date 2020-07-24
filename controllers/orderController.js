const { Order } = require('../models/Order');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsyncErrors');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.createOrder = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  await Order.create(req.body);
  const msg = {
    to: req.user.email,
    from: 'damiflo94@gmail.com',
    subject: 'New Order',
    text: `Thank You for the new order your transaction id is ${req.body.transactionid}`,
    html: `<h3>Total amount : ${req.body.amount}<h3>`,
  };
  try {
    await sgMail.send(msg);
  } catch (err) {
    console.log(err);
  }

  res.status(200).send('success');
});

exports.getUserOrderHistory = catchAsync(async (req, res) => {
  const id = req.user._id;

  const orderhistory = await Order.find({ user: id });
  res.status(201).json(orderhistory);
});

exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find();
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
