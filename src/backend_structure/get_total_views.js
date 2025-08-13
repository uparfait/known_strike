const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function get_total_views(req, res) {
  try {
    const total_views = await Movies.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    if (!total_views || total_views.length === 0) {
      return res.status(200).json({ success: true, total_views: 0 });
    }

    return res
      .status(200)
      .json({ success: true, total_views: total_views[0]?.total || 0 });
  } catch (error) {
    await log(false, "error", `Error fetching total views: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Unexpected Error Occurred!", success: false });
  }
};
