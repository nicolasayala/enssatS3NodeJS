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
        req.checkBody('email', 'Email is required.').notEmpty();
        req.checkBody('email', 'Please enter a valid email.').isEmail();
        req.checkBody('password', 'Password is required.').notEmpty();

        const errors = req.validationErrors();
        if (!errors) {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if (!user) {
                    res.render('signin', {
                        title: 'Sign in',
                        errors: [{msg: 'Invalid email or password.'}],
                        data: req.body,
                    });
                } else {
                    bcrypt.compare(req.body.password, user.password, function(err, valid) {
                        if (valid) {
                            console.log("User " + user + " logged in.");
                            // sets a cookie with the user's info
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
        } else {
            res.render('signin', {
                title: 'Sign in',
                errors: errors,
                data: req.body,
            });
        }

    });

module.exports = router;
