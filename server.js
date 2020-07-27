const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: 'config.env' });
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

const dbconnection = mongoose
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
  console.log(`Server running at port: ${port}`)
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
  console.log('Uncaught exception SERVER SHUTTING DOWN😧');

  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👏 SIGTEERM RECEIVED, shutting down');
  server.close(() => console.log('process terminated'));
});

process.on('SIGINT', () => {
  console.log('SIGINT RECEIVED shutting down');
  server.close((err) => {
    if (err) {
      process.exit(1);
    }

    mongoose.connection.close(() => {
      process.exit(0);
    });
  });
});
