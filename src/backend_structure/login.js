const jwt = require("jsonwebtoken");
const log = require("../../Utilities/logger");

const admin_data = {
  username: "cinevido",
  password: "CINEMOVIES",
};

module.exports = async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (username !== admin_data.username || password !== admin_data.password) {
      return res
        .status(200)
        .json({ error: "Invalid credentials", success: false });
    }

    const token = jwt.sign({ username: admin_data.username }, "CINEVIDO", {
      expiresIn: "24h",
    });

    await log(
      false,
      "info",
      `Admin logged in at ${new Date().toLocaleString()}`
    );

    return res.status(200).json({ token, success: true });
  } catch (error) {
    await log(false, "error", `Error logging in: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
