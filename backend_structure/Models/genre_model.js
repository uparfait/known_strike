
const mongoose = require('mongoose');

const genres_schema = new mongoose.Schema({
  name: { type: String, required: true },
}, {
  timestamps: true
});

const Genres = mongoose.model('genres', genres_schema);
module.exports = Genres;
