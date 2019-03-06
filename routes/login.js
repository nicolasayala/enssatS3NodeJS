const express = require('express');
const {body,validationResult} = require('express-validator/check');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('login', {
        title: "Login"
    });
});

router.post('/',
    [
        body('email')
        .isLength({
            min: 1
        })
        .withMessage('Please enter an email.'),
        body('password')
        .isLength({
            min: 1
        })
        .withMessage('Please enter a password.'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if (!user) {
                    res.render('login', {
                        title: 'Login',
                        errors: [{msg: 'Invalid email or password.'}],
                        data: req.body,
                    });
                } else {
                    if (req.body.password === user.password) {
                        console.log("User " + user + " logged in.");
                        // sets a cookie with the user's info
                        // req.session.user = user;
                        res.redirect('./users');
                    } else {
                        res.render('login', {
                            title: 'Login',
                            errors: [{msg: 'Invalid email or password.'}],
                            data: req.body,
                        });
                    }
                }
            });
        } else {
            res.render('login', {
                title: 'Login',
                errors: errors.array(),
                data: req.body,
            });
        }

    });

module.exports = router;
