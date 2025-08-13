const mongoose = require('mongoose');


const movies_schema = new mongoose.Schema({
  name: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String, required: true, minlength: 100, maxlength: 500 },
  download_url: { type: String, required: true },
  watch_url: { type: String, required: true },
  thumbnail_image: { type: String, required: true },

  views: { type: Number, default: 0 },
  views_short: { type: String, default: '0' },
  download_count: { type: Number, default: 0 },
  download_count_short: { type: String, default: '0' },

  release_date: { type: mongoose.Schema.Types.Mixed },
  is_interpreted: { type: Boolean, default: false },
  interpreter: { type: String, default: null },
  display_language: { type: String, required: true },
  country: {type: String},

  is_serie: { type: Boolean, default: false },
  linked_serie: { type: String },

  visibility: { 
    
    type: String, 
    enum: ['show', 'hidden'], 
    default: 'show' 
  }
}, {
  timestamps: true
});

const Movies = mongoose.model('movies', movies_schema);
module.exports = Movies;