/**
 *
 * games.js
 *
 * Route /games
 * handle all request on /games and /games/scores
 *
 */

const express = require('express');
const sessionChecker = require('../utils/session-checker');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const Highscore = mongoose.model('Highscore');
const router = express.Router();

router.get('/', sessionChecker.filterLoggedOut, (req, res) => {
    //search all the games in the database
    Game.find()
        .then((games) => {
            User.findOne({email: req.session.user.email})
                .populate([{path: "highscores", select: "game value"}, {
                    path: "highscores",
                    populate: {path: "game", select: "name"}
                }])
                //replace id by object for user.highscores[i].value and user.highscores[i].game.name
                .then((user) => {
                    if (user == null) {
                        res.send('Sorry! Something went wrong. (login)');
                        return;
                    }
                    let personalHighscores = {};
                    for (let hs of user.highscores) {
                        personalHighscores[hs.game.name] = hs.value;
                    }
                    res.render('games',
                        {title: 'Listing games', games: games, admin: req.session.user.isAdmin, personalHighscores});
                });
        })
        .catch(() => {
            res.send('Sorry! Something went wrong.');
        });
});

router.get('/scores', sessionChecker.filterLoggedOut, (req, res) => {
    if (!req.query.hasOwnProperty("game")) {
        res.redirect("/games");
        return;
    }
    //find the game with the name in the url (/games?game=Tetris)
    Game.findOne({name: req.query.game})
        .populate([{path: "highscores", select: "user value"}, {
            path: "highscores",
            populate: {path: "user", select: "isBanned isAdmin email"}
        }])
        //replace id by object for game.highscores[i].value and game.highscores[i].user.(isBanned/isAdmin/email)
        .then((game) => {
            if (game)
                res.render('scores', {title: 'Tableau des scores ', game: game, admin: req.session.user.isAdmin});
            else
                res.render('scores', {
                    title: 'Game "' + req.query.game + '" not found',
                    game: null,
                    admin: req.session.user.isAdmin
                });
        })
        .catch(() => {
            res.send('Sorry! Something went wrong.');
        });
});

router.post('/scores', sessionChecker.filterLoggedOut, (req, res) => {
    //console.log("p req body ->", req.body);
    //console.log("p req query ->", req.query);
    if (!(req.body.hasOwnProperty("new_score") && req.query.hasOwnProperty("game"))) {
        res.sendStatus(222);
        return;
    }
    Game.findOne({name: req.query.game}, (err, game) => {
        if (err) {
            console.log("err", err);
            return;
        }
        User.findOne({email: req.session.user.email})
            .then((user) => {
                if (!game) {
                    res.send('Game "' + req.query.game + '" not found');
                    console.error('post : Game "' + req.query.game + '" not found');
                } else if (!user) {
                    res.send('user not found');
                    console.error('post : user not found', req.session.user.email)
                } else {
                    update_highscore(game, user, req.body.new_score, () => {
                        console.log('score updated');
                        res.sendStatus(201);
                    })
                }
                req.session.user = user;
            })
            .catch(() => {
                res.send('Sorry! Something went wrong. user');
            });
    })
});


/**
 * Update the highscore for a user on a game
 * @param {Object} game Mongoose (Game) model for a specific game
 * @param {Object} user Mongoose (User) model for a specific game
 * @param {Number} new_score the new value of highscores
 * @param callback function which will be called when done
 */
function update_highscore(game, user, new_score, callback) {
    console.log("highscore", game.highscore);
    if (game.highscore < new_score) {
        game.highscore = new_score;
        game.save();
    }
    Highscore.findOne({game: game._id, user: user._id})
        .then((hs) => {
            //if the player has not played the game before we need to create an entry
            if (hs == null) {
                hs = new Highscore({game: game._id, user: user._id, value: 0});
                //hs.save();//needed to generate the _id ?? --no it's done on object creation
                user.highscores.push(hs._id);
                user.save();
                game.highscores.push(hs._id);
                game.save();
                console.log("should have new score ", hs._id);
            }
            if (hs.value < parseInt(new_score)) {
                hs.value = parseInt(new_score);
                console.log("new highscore ", new_score, user.email);
                hs.save();
            }
            //console.log(hs, game, user);
            callback();
        })
        .catch(() => {
            console.error("error when updating highscore");
            callback();
        });
}

module.exports = router;
