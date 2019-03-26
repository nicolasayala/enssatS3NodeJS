const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  isAdmin: Boolean,
  isBanned: Boolean,
  highscores: [{
    game: String,
    highscore: Number,
  }],
});

module.exports = mongoose.model('User', userSchema);
