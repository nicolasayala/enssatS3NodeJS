const express = require('express');
const bodyParser = require('body-parser');
const cookierParser = require('cookie-parser');
const expressValidator = require('express-validator');
const sessionChecker = require('./utils/session-checker');
const session = require('express-session');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
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
        expires: 6000000
    }
}));

// Routes setup
const routes = ["users", "signin", "signup", "logout", "games"];
for(route of routes) {
    app.use("/"+route, require("./routes/" + route));
}

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
app.get('/', sessionChecker.filterLoggedOut, (req, res) => {
    res.redirect('/games');
});

module.exports = app;
