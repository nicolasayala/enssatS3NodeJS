const express = require('express');
const sessionChecker = require('../utils/session-checker');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const Highscore = mongoose.model('Highscore');
const router = express.Router();

router.get('/', sessionChecker.filterLoggedOut, (req, res) => {
    Game.find()
        .then((games) => {
            User.findOne({email:req.session.user.email})
                .populate([{path:"highscores", select:"game value"},{path:"highscores", populate:{path:"game", select:"name"}}])
                .then((user)=>{
                    if(user==null) {
                        res.send('Sorry! Something went wrong. (login)');
                        return;
                    }
                    let personalHighscores={};
                    console.log(user);
                    for(let hs of user.highscores){
                        personalHighscores[hs.game.name]=hs.value;
                    }
                    console.log("personnalHighscore : ", personalHighscores);
                    res.render('games',
                        { title: 'Listing games', games: games, admin: req.session.user.isAdmin, personalHighscores });
                });
        })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
});

router.get('/scores', sessionChecker.filterLoggedOut, (req, res) => {
    console.log("g req query ->", req.query);
    if (!req.query.hasOwnProperty("game")) {
        res.redirect("/games");
        return;
    }
    Game.findOne({name: req.query.game})
        .populate([{path:"highscores", select:"user value"},{path:"highscores", populate:{path:"user", select:"isBanned isAdmin email"}}])
        .then((game) => {
            console.log("gJSON", JSON.stringify(game));
            if(game)
                res.render('scores', {title: 'Tableau des scores ', game: game, admin: req.session.user.isAdmin});
            else
                res.render('scores', {title: 'Game "' + req.query.game + '" not found', game: null, admin: req.session.user.isAdmin});
        })
        .catch(() => {
            res.send('Sorry! Something went wrong.');
        });
});

router.post('/scores', sessionChecker.filterLoggedOut, (req, res) => {
    console.log("p req body ->", req.body);
    console.log("p req query ->", req.query);
    if (!(req.body.hasOwnProperty("new_score") && req.query.hasOwnProperty("game"))) {
        res.sendStatus(222);
        return;
    }
    Game.findOne({name:req.query.game}, (err, game)=>{
        if(err){
            console.log("err",err);
            return;
        }
            User.findOne({email: req.session.user.email})
                .then((user)=>{
                    if(!game){
                        res.send('Game "' + req.query.game + '" not found');
                        console.log('Game "' + req.query.game + '" not found');
                    }else if(!user){
                        res.send('user not found');
                        console.log('user not found')
                    }else{
                        update_highscore(game, user, req.body.new_score, ()=>{
                            console.log('score updated');
                            res.sendStatus(201);
                        })
                    }
                    req.session.user=user;
                })
                .catch(() => {
                    res.send('Sorry! Something went wrong. user');
                });
        })
        // .catch(() => {
        //     res.send('Sorry! Something went wrong. game');
        // });
});

function update_highscore(game, user, new_score, callback) {
    console.log("highscore", game.highscore);
    if(game.highscore<new_score){
        game.highscore=new_score;
        game.save();
    }
    Highscore.findOne({game:game._id, user:user._id})
        .then((hs)=> {
            if (hs == null) {
                hs = new Highscore({game: game._id, user:user._id, value: 0});
                hs.save();//needed to generate the _id ?? todo check _id generation
                user.highscores.push(hs._id);
                user.save();
                game.highscores.push(hs._id);
                game.save();
                console.log("should have new score ", hs._id);
            }
            if (hs.value <= parseInt(new_score)) {
                hs.value = parseInt(new_score);
                console.log("new highscore ", new_score, user.email);
                hs.save();
            }
        })
        .catch(() => {
            console.log("error when updating highscore")
        });
}

module.exports = router;
