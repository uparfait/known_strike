const mongoose = require('mongoose');

const watch_list_schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movies', required: true },
});

const WatchList = mongoose.model('WatchList', watch_list_schema);

module.exports = WatchList;