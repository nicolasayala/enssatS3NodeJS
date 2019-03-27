const express = require('express');
const sessionChecker = require('../utils/session-checker');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', sessionChecker.filterUser, (req, res) => {
    User.find()
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

router.post('/', (req, res) => {
    User.findById(req.body.id, (err, user) => {
        if (user) {
            user.isBanned = req.body.hasOwnProperty('banned') && (req.body.banned == 'on')
            user.isAdmin = req.body.hasOwnProperty('admin') && (req.body.admin == 'on')
            user.save().then(() => res.redirect('/users'))
        } else {
            res.send('Sorry! Something went wrong.');
        }
    });
});

module.exports = router;
