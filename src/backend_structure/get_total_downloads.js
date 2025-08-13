const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function get_total_downloads(req, res) {
  try {
    const total_downloads = await Movies.aggregate([
      { $group: { _id: null, total: { $sum: "$download_count" } } },
    ]);
    return res
      .status(200)
      .json({ success: true, total_downloads: total_downloads[0]?.total || 0 });
  } catch (error) {
    await log(
      false,
      "error",
      `Error fetching total downloads: ${error.message}`
    );
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
