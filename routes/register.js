const express = require('express');
const {body,validationResult} = require('express-validator/check');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('register', {
        title: "Register"
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
                    const user = new User(req.body);
                    console.log("User " + user + " registered.");
                    user.save()
                        .then(() => {res.redirect('./');})
                        .catch(() => {res.send('Sorry! Something went wrong.');});
                } else {
                    res.render('register', {
                        title: "Register",
                        errors: [{msg: 'Email already in use.'}],
                        data: req.body,
                    });
                }
            });
        } else {
            res.render('register', {
                title: "Register",
                errors: errors.array(),
                data: req.body,
            });
        }
    });

module.exports = router;
