/**
 * users.js
 *
 * Route /users
 * Displays user list for admins
 *
 */

const express = require('express');
const sessionChecker = require('../utils/session-checker');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();

// Route for user list
router.get('/', sessionChecker.filterUser, (req, res) => {
    User.find() // Get all users in database
        .then((users) => {
            res.render('users', {
                title: 'Listing users',
                users,
                admin: true
            });
        })
        .catch(() => {
            res.send('Sorry! Something went wrong.');
        });
});

// Changes in user privileges (admin or banned)
router.post('/', (req, res) => {
    // Finds the user in database with id contained in form
    User.findById(req.body.id, (err, user) => {
        if (user) {
            // Updates privileges
            user.isBanned = req.body.hasOwnProperty('banned') && (req.body.banned == 'on')
            user.isAdmin = req.body.hasOwnProperty('admin') && (req.body.admin == 'on')
            // Saves user
            user.save().then(() => res.redirect('/users'))
        } else {
            res.send('Sorry! Something went wrong.');
        }
    });
});

module.exports = router;
