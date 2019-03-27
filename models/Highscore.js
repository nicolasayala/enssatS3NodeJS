const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({
  game: {type: ObjectId, ref:'Game'},
  user: {type: ObjectId, ref:'User'},
  value: Number,
});

module.exports = mongoose.model('Highscore', userSchema);
