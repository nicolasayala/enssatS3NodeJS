/**
 * signup.js
 *
 * Route /signup
 * Handles users signup
 *
 */

const express = require('express');
const mongoose = require('mongoose');
const sessionChecker = require('../utils/session-checker');
const bcrypt = require('bcrypt');
const User = mongoose.model('User');
const router = express.Router();

// Route for signup
router.get('/', sessionChecker.filterLoggedIn, (req, res) => {
    res.render('signup', {
        title: "Sign Up"
    });
});

router.post('/', (req, res) => {
    // Checks for invalid user input
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Please enter a valid email.').isEmail();
    req.checkBody('password', 'Password is required.').notEmpty();

    const errors = req.validationErrors();
    if (!errors) {
        // Finds user in database with email
        User.findOne({
            email: req.body.email
        }, function(err, user) {
            if (!user) { // No users with that email yet
                const user = new User(req.body);
                user.isAdmin = false
                user.isBanned = false
                // Hashes user's password
                bcrypt.hash(user.password, 10, function(err, hash) {
                    user.password = hash;
                    console.log("User " + user + " registered.");
                    // Saves user in database
                    user.save()
                        .then(() => {res.redirect('/');})
                        .catch(() => {res.send('Sorry! Something went wrong.');});
                });
            } else { // Already an user with same email
                res.render('signup', {
                    title: "Sign up",
                    errors: [{msg: 'Email already in use.'}],
                    data: req.body,
                });
            }
        });
    } else { // There are errors, send back errors and user data
        res.render('signup', {
            title: "Sign up",
            errors: errors,
            data: req.body,
        });
    }
});

module.exports = router;
