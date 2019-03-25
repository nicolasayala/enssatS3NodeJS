const express = require('express');
const mongoose = require('mongoose');
const sessionChecker = require('../utils/session-checker');
const bcrypt = require('bcrypt');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', sessionChecker.filterLoggedIn, (req, res) => {
    res.render('signup', {
        title: "Sign Up"
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
                const user = new User(req.body);
                user.isAdmin = false
                user.isBanned = false
                bcrypt.hash(user.password, 10, function(err, hash) {
                    user.password = hash;
                    console.log("User " + user + " registered.");
                    user.save()
                        .then(() => {res.redirect('/');})
                        .catch(() => {res.send('Sorry! Something went wrong.');});
                });
            } else {
                res.render('signup', {
                    title: "Sign up",
                    errors: [{msg: 'Email already in use.'}],
                    data: req.body,
                });
            }
        });
    } else {
        res.render('signup', {
            title: "Sign up",
            errors: errors,
            data: req.body,
        });
    }
});

module.exports = router;
