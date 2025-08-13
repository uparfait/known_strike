const mongoose = require('mongoose');

const logs_schema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    log_data: { type: String, required: true }
  }
);

const Logs = mongoose.model('logs', logs_schema);

module.exports = Logs;