const express = require('express');
const sessionChecker = require('../utils/session-checker');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const router = express.Router();

router.get('/', sessionChecker.filterLoggedOut, (req, res) => {
    Game.find()
        .then((games) => {
            res.render('games',
            { title: 'Listing games', games: games, admin: req.session.user.isAdmin });
        })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
});

router.get('/scores', sessionChecker.filterLoggedOut, (req, res) => {
    console.log("req query ->", req.query);
    if (!req.query.hasOwnProperty("game")) {
        res.redirect("/games");
    }
    Game.findOne({name: req.query.game})
        .then((game) => {
            if(game)
                res.render('scores', {title: 'Tableau des scores ', game: game});
            else
                res.render('scores', {title: 'Game "' + req.query.game + '" not found', game: null});
        })
        .catch(() => {
            res.send('Sorry! Something went wrong.');
        });
});

router.post('/scores', sessionChecker.filterLoggedOut, (req, res) => {
    console.log("req body ->", req.body);
    if (!(req.body.hasOwnProperty("new_score") && req.query.hasOwnProperty("game"))) {
        res.sendStatus(201);
        return;
    }
    let user = req.session.user;
    User.findOne({email:req.session.user.email})
        .then((user)=>{
            update_highscore(user, req.query.game, req.body.new_score);
            req.session.user=user;
            res.sendStatus(200);
        })
        .catch(() => {
            res.send('Sorry! Something went wrong.');
        });
});

function update_highscore(user, game, new_score) {
    let hs = null;
    for (hs of user.highscores) {
        if (hs.game == game) {
            break;
        }
    }
    if (hs == null) {
        hs = {game: game, highscore: 0};
        user.highscores.push(hs);
        console.log("should have new score");
    }
    if (hs.highscore < parseInt(new_score)) {
        hs.highscore = parseInt(new_score);
        console.log("new highscore ", new_score, user.email);
        user.save();
    }
}

module.exports = router;
