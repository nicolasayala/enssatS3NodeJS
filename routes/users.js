const express = require('express');
const {body,validationResult} = require('express-validator/check');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', (req, res) => {
  User.find()
    .then((users) => {
      res.render('index', { title: 'Listing users', users });
    })
    .catch(() => { res.send('Sorry! Something went wrong.'); });
});

module.exports = router;
