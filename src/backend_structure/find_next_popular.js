const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function find_next_popular(req, res) {
  try {
    const { loaded_idx = [] } = req.body;

    if (!Array.isArray(loaded_idx)) {
      await log(false, "warning", "Invalid loaded_idx format");
      return res.status(200).json({
        error: "loaded_idx must be an array",
        success: false,
      });
    }

    const popular_movies = await Movies.aggregate([
      {
        $match: {
          _id: { $nin: loaded_idx },
        },
      },
      {
        $sort: {
          views: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    return res.status(200).json({
      success: true,
      movies: popular_movies,
      count: popular_movies.length,
    });
  } catch (error) {
    await log(
      false,
      "error",
      `Error fetching next popular movies: ${error.message}`,
      {
        loaded_idx: loaded_idx,
      }
    );
    return res.status(500).json({
      error: "Unexpected Error Occurred while fetching popular movies!",
      success: false,
    });
  }
};
