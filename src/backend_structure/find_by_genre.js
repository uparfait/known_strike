const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function find_by_genre(req, res) {
  try {
    let { genre } = req.params;
    genre = genre.trim().toLowerCase();

    if (genre === "popular") {
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
    }

    if (genre === "all") {
      const all_movies = await Movies.aggregate([
        {
          $sample: { size: 18 },
        },
      ]);
      return res.status(200).json({ movies: all_movies, success: true });
    }

    const movies = await Movies.aggregate([
      { $match: { genre: { $regex: new RegExp(`^${genre}$`, "i") } } },
      { $sample: { size: 18 } },
    ]);
    return res.status(200).json({ movies, success: true });
  } catch (error) {
    await log(
      false,
      "error",
      `Error finding movies by genre: ${error.message}`
    );
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
