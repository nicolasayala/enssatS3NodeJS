require('dotenv').config();
const mongoose = require('mongoose');
require('./models/User');
require('./models/Game');
require('./models/Highscore');
const app = require('./app');

// Connects to moongodb
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
mongoose.connection
    .on('connected', () => {
        console.log(`Mongoose connection open on ${process.env.DATABASE}`);
    })
    .on('error', (err) => {
        console.log(`Connection error: ${err.message}`);
    });

// Open server on port 3000
const server = app.listen(3000, () => {
  console.log(`Express is running on port ${server.address().port}`);
});
