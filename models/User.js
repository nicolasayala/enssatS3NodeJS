/**
 * User.js
 * user's schema
 */

const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true, // removes spacings before and after input
  },
  password: {
    type: String,
    trim: true,
  },
  isAdmin: Boolean,
  isBanned: Boolean,
  highscores: [{type: ObjectId, ref:'Highscore'}],
});

module.exports = mongoose.model('User', userSchema);
