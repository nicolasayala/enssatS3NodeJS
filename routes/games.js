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
router.get('/scores', sessionChecker.filterLoggedOut, (req, res) => {
      if(req.params.game) {
        Game.findOne({
          name: req.params.game
        })
        .then((game) => {
            res.render('scores', {title: 'Tableau des scores ', game: game});
        })
        .catch(() => {
          res.send('Sorry! Something went wrong.');
        });
      }else
        res.render('scores', {title: 'Game "'+req.params.game+'" not found', game: null});
});

module.exports = router;
