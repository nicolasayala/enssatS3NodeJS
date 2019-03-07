// middleware functions to check for logged-in/logged-out users

// Only calls next if the user is logged-in
exports.filterLoggedOut = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.redirect('/signin');
    }
};

// Only calls next if the user is logged-out
exports.filterLoggedIn = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/users');
    } else {
        next();
    }
};
