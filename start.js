require('dotenv').config();
const mongoose = require('mongoose');

console.log(process.env.DATABASE);

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection
    .on('connected', () => {
      console.log(`Mongoose connection open on ${process.env.DATABASE}`);
    })
    .on('error', (err) => {
      console.log(`Connection error: ${err.message}`);
    });
+

const app = require('./app');

const server = app.listen(3001, () => {
  console.log(`Express is running on port ${server.address().port}`);
});
