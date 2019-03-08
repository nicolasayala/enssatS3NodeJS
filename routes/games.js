const express = require('express');
const sessionChecker = require('../utils/session-checker');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const router = express.Router();

router.get('/', sessionChecker.filterLoggedOut, (req, res) => {
    Game.find()
        .then((games) => {
            res.render('games', { title: 'Listing games', games: games });
        })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
});

module.exports = router;
