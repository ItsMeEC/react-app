const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
  googleId: String,
  location: String,
  name: String,
});

module.exports = mongoose.model('User', User);
