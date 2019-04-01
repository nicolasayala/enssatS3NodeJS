/**
 *
 * Signin.js
 *
 * Route /signin
 * handle all request on /signin
 *
 */


const express = require('express');
const mongoose = require('mongoose');
const sessionChecker = require('../utils/session-checker');
const bcrypt = require('bcrypt');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', sessionChecker.filterLoggedIn, (req, res) => {
    res.render('signin', {
        title: "Sign in"
    });
});

router.post('/', (req, res) => {
    // check for errors
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Please enter a valid email.').isEmail();
    req.checkBody('password', 'Password is required.').notEmpty();

    const errors = req.validationErrors();
    if (errors) {
        res.render('signin', {
            title: 'Sign in',
            errors: errors,
            data: req.body,
        });
        return;
    }

    // find the current user in the database
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (!user) {
            //email for user not found
            res.render('signin', {
                title: 'Sign in',
                errors: [{msg: 'Invalid email or password.'}],
                data: req.body,
            });
        } else {
            //check password hash from database with input password
            bcrypt.compare(req.body.password, user.password, (err, valid) => {
                if (valid) {
                    if (user.isBanned) {
                        //inform user that he is ban
                        res.render('signin', {
                            title: 'Sign in',
                            errors: [{msg: 'Your account has been banned.'}],
                            data: req.body,
                        });
                        return;
                    }
                    console.log("User " + user + " logged in.");
                    // save user in session
                    req.session.user = user;
                    res.redirect('/');
                } else {
                    res.render('signin', {
                        title: 'Sign in',
                        errors: [{msg: 'Invalid email or password.'}],
                        data: req.body,
                    });
                }
            });
        }
    });
});

module.exports = router;
