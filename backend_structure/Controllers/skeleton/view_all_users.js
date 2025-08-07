const log = require("../../Utilities/logger");
const Users = require("../../Models/users_model");

module.exports = async function view_all_users(req, res) {
  try {
    const users = await Users.find();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    await log(false, "error", `Error fetching users: ${error.message}`);
    return res.status(500).json({ error: "Unexpected Error Occured!", success: false });
  }
}