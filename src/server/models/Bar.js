const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Bar = new Schema({
  name: String,
  id: String,
  going: Array,
  expire_at: {
    type: Date,
    default() {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0);
      return midnight;
    },
  },
});

module.exports = mongoose.model('Bar', Bar);
