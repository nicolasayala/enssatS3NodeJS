const express = require('express');
const sessionChecker = require('../utils/session-checker');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', sessionChecker.filterUser, (req, res) => {
  User.find()
    .then((users) => {
      res.render('users', { title: 'Listing users', users, admin:true });
    })
    .catch(() => { res.send('Sorry! Something went wrong.'); });
});

module.exports = router;
