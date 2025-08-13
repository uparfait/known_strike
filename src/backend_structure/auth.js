const log = require("../Utilities/logger.js");
const jwt = require("jsonwebtoken");

module.exports = async function authenticateToken(req, res, next) {
  return next();
  try {
    const auth_header =
      req.headers["authorization"] || req.headers["Authorization"];
    const token = auth_header && auth_header.split(" ")[1];

    if (!token) {
      await log(false, "warning", "No token provided");
      return res
        .status(401)
        .json({ error: "Access token required", success: false });
    }

    jwt.verify(token, "CINEVIDO", async (err, decoded) => {
      if (err) {
        await log(false, "warning", `Invalid token attempt: ${err.message}`);
        return res
          .status(403)
          .json({ error: "Invalid or expired token", success: false });
      }

      return next();
    });
  } catch (error) {
    await log(false, "error", `Error authenticating token: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Sorry! try again later", success: false });
  }
};
