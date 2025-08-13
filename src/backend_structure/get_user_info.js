const jwt = require("jsonwebtoken");
const log = require("../../Utilities/logger");

module.exports = async function get_user_info(req, res) {
  try {
    const auth_header =
      req.headers["authorization"] || req.headers["Authorization"];
    const token = auth_header && auth_header.split(" ")[1];

    if (!token) {
      return res
        .status(200)
        .json({ error: "Access token required", success: false });
    }

    jwt.verify(token, "CINEVIDO", async (err, decoded) => {
      if (err) {
        await log(
          false,
          "warning",
          `Invalid token attempt in get_user_info: ${err.message}`
        );
        return res
          .status(200)
          .json({ error: "Invalid or expired token", success: false });
      }

      const userInfo = {
        username: decoded.username,
      };

      await log(
        false,
        "info",
        `admin: ${decoded.username} logged in at ${new Date()}`
      );
      return res.status(200).json({ user: userInfo, success: true });
    });
  } catch (error) {
    await log(false, "error", `Error getting user info: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Sorry! try again later", success: false });
  }
};
