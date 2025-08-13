const Logs = require('../../Models/logs_model.js');
const logger = require('../../Utilities/logger.js');

module.exports = async function clear_all_logs(req, res) {
    try {
        await Logs.deleteMany({});
        return res.status(200).json({
            success: true,
            message: "All logs cleared successfully"
        });
    } catch (error) {
        await logger(false, "error", `Error clearing logs: ${error.message}`);
        return res.status(500).json({
            error: "An error occurred while clearing logs",
            success: false,
        });
    }
}