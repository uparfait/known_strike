const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function find_popular_movie(req, res) {
  try {
    const popular_movies = await Movies.aggregate([
      {
        $sort: {
          views: -1,
        },
      },
      {
        $limit: 18,
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
      `Error fetching popular movies: ${error.message}`
    );
    return res.status(500).json({
      error: "Unexpected Error Occurred while fetching popular movies!",
      success: false,
    });
  }
};
