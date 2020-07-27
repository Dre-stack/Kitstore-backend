const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '.env' });
//UNCAUGH EXEPTION
process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('UNHANDLED REJECTION SERVER SHUTTING DOWN😧');

  process.exit(1);
});

const app = require('./app');

// DATABASE

const DB = process.env.DATABASE;

// const DB =
//   'mongodb+srv://bigdre:8wssIQH5iqHvJtoZ@cluster0-ih3vd.mongodb.net/kitstore?retryWrites=true&w=majority';

mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));

//Server
const port = process.env.PORT || 8000;
const server = app.listen(port, () =>
  console.log(`app running at port: ${port}`)
);

// Unhandles rejection.
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION SERVER SHUTTING DOWN😧');
  server.close(() => {
    process.exit(1);
  });
});

//UNCAUGH EXEPTION
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION SERVER SHUTTING DOWN😧');

  process.exit(1);
});
