const express = require('express');
const bodyParser = require('body-parser');
const cookierParser = require('cookie-parser');
const expressValidator = require('express-validator');
const sessionChecker = require('./utils/session-checker');
const session = require('express-session');
const path = require('path');
const users = require('./routes/users');
const signin = require('./routes/signin');
const signup = require('./routes/signup');
const logout = require('./routes/logout');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));
// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookierParser());
// initialize expressValidator to parse input errors
app.use(expressValidator());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'K4Ng4ev9i5yACrEoeUBm',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use('/users', users);
app.use('/signin', signin);
app.use('/signup', signup);
app.use('/logout', logout);

app.use(express.static('public'));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

// route for Home-Page
app.get('/', sessionChecker.filterLoggedIn, (req, res) => {
    res.redirect('/signin');
});

module.exports = app;
