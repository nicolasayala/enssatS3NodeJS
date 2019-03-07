const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    image: { //image uri source
        type: String,
        trim: true,
    },
});

module.exports = mongoose.model('Game', gameSchema);
