const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const productsRoutes = require('./routes/productsRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const braintreeRoutes = require('./routes/braintreeRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

/*
////////////////////
   MIDDLEWARES
///////////////////
 */

app.use(cors({ credentials: true, origin: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

/*
////////////////////
  ROUTES
///////////////////
 */

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/braintree', braintreeRoutes);
app.use('/api/v1/orders', orderRoutes);

/*
////////////////////
 UNHADLED ROUTES
///////////////////
 */
app.use('*', (req, res, next) => {
  next(
    new AppError(
      ` can not find ${req.originalUrl} on this server`,
      404
    )
  );
});

/*
////////////////////
 GLOBAL ERROR HANDLER
///////////////////
 */
app.use(globalErrorHandler);

module.exports = app;
