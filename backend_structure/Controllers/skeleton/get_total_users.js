const log = require("../../Utilities/logger");
const Users = require("../../Models/users_model");

module.exports = async function get_total_users(req, res) {
  try {
    const total_users = await Users.countDocuments();
    return res.status(200).json({ success: true, total_users });
  } catch (error) {
    await log(false, "error", `Error fetching total users: ${error.message}`);
    return res.status(500).json({ error: "Unexpected Error Occured!", success: false });
  }
}