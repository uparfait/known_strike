const Movies = require("../../Models/movies_model");
const log = require("../../Utilities/logger");

module.exports = async function get_total_movies(req, res) {
  try {
    const total_movies = await Movies.countDocuments({ visibility: "show" });
    return res.status(200).json({
      success: true,
      total_movies: total_movies,
    });
  } catch (error) {
    await log(false, "error", `Error fetching total movies: ${error.message}`);
    return res.status(500).json({
      error: "Sorry! try again later",
      success: false,
    });
  }
}