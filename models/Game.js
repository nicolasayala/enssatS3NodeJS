const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    author: String,
    highscore: Number,
});

module.exports = mongoose.model('Game', gameSchema);
