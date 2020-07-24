const braintree = require('braintree');
const User = require('../models/User');

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

exports.generateToken = (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(response);
    }
  });
};

exports.processPayment = (req, res) => {
  // console.log(req.body);
  const nonceFromTheclient = req.body.paymentMethodNonce;
  const amountFromClient = req.body.amount;

  gateway.transaction.sale(
    {
      amount: amountFromClient,
      paymentMethodNonce: nonceFromTheclient,
      options: {
        submitForSettlement: true,
      },
    },
    (err, result) => {
      if (err) {
        res.status(500).json({ err });
      } else {
        res.status(200).json(result);
      }
    }
  );
};
