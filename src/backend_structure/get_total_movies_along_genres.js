const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function get_total_movies_along_genres(req, res) {
  try {
    const total_movies_along_genres = await Movies.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
    ]);
    return res.status(200).json({ success: true, total_movies_along_genres });
  } catch (error) {
    await log(
      false,
      "error",
      `Error fetching total movies along genres: ${error.message}`
    );
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
