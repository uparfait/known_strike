const mongoose = require('mongoose');

const user_schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Users = mongoose.model('Users', user_schema);

module.exports = Users;