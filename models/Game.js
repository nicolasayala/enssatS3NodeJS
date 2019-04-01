/**
 * @file
 * game's schema
 */

const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const gameSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    author: String,
    highscore: Number,
    highscores: [{type: ObjectId, ref:'Highscore'}],
});

module.exports = mongoose.model('Game', gameSchema);
