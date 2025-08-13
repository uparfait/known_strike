const Logs = require('../../Models/logs_model.js');
const logger = require('../../Utilities/logger.js');

module.exports = async function view_all_logs(req, res) {
  try {
    const logs = await Logs.find().sort({ createdAt: -1 });

    if (!logs || logs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No logs found",
        logs: [],
      });
    }

    return res.status(200).json({
      success: true,
      logs: logs,
      count: logs.length,
    });
  } catch (error) {
    await logger(false, "error", `Error in view_all_logs: ${error.message}`);
    return res.status(500).json({
      error: "An error occurred while fetching logs",
      success: false,
    });
  }
};