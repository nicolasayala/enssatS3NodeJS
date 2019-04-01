// middleware functions to check for logged-in/logged-out/admin users

/**
 * Only calls next when the user is logged-in, instead redirects to /signin.
 * @param req - http req
 * @param res - http res
 * @param next - callback
 **/
exports.filterLoggedOut = (req, res, next) => {
    if (req.cookies.user_sid && req.session.user) {
        next();
    } else {
        res.redirect('/signin');
    }
};

/**
 * Only calls next when the user is logged-out, instead redirects to /.
 * @param req - http req
 * @param res - http res
 * @param next - callback
 **/
exports.filterLoggedIn = (req, res, next) => {
    if (req.cookies.user_sid && req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
};

/**
 * Only calls next when the user is admin, instead redirects to /.
 * @param req - http req
 * @param res - http res
 * @param next - callback
 **/
exports.filterUser = (req, res, next) => {
    if (req.cookies.user_sid && req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.redirect('/');
    }
};
