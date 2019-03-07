const express = require('express');
const sessionChecker = require('../utils/session-checker');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', sessionChecker.filterLoggedOut, (req, res) => {
  User.find()
    .then((users) => {
      res.render('index', { title: 'Listing users', users });
    })
    .catch(() => { res.send('Sorry! Something went wrong.'); });
});

module.exports = router;
