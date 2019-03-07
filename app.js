const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const users = require('./routes/users');
const login = require('./routes/login');
const register = require('./routes/register');
const games = require('./routes/games');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', login);
app.use('/users', users);
app.use('/register', register);
app.use('/games', games);

app.use(express.static('public'));

module.exports = app;
