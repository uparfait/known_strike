const Logs = require('../Models/logs_model.js');

module.exports = async function log(terminal, type, log_data) {

  try {
    const log_entry = new Logs({ type, log_data });
    await log_entry.save();
    if (terminal) {
      console.log(log_data);
    }

    return 1;
  } catch (error) {
    console.error('Error logging data:', error);
    return 0;
  }
  
}