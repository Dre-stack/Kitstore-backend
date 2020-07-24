const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  size: String,
  quantity: Number,
  color: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    products: {
      type: Array,
    },
    transactionid: String,
    address: {
      type: Array,
    },
    amount: Number,
    status: {
      type: String,
      default: 'Not Processed',
      enum: [
        'Not Processed',
        'Processing',
        'Shipped',
        'Deliverd',
        'Canceled',
        'Finished',
      ],
    },
    updated: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

const CartItem = mongoose.model('CartItem', cartSchema);

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order, CartItem };
