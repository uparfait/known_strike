const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function get_related_movies(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      await log(false, "warning", "No id provided for related movies");
      return res.status(200).json({
        error: "id is required",
        success: false,
      });
    }

    const movie = await Movies.findById(id);
    if (!movie) {
      await log(false, "warning", `Movie not found: ${id}`);
      return res.status(200).json({
        error: "Movie not found",
        success: false,
      });
    }

    const related_movies = await Movies.aggregate([
      {
        $match: {
          genre: movie.genre,
          _id: { $ne: movie._id },
        },
      },
      { $sample: { size: 18 } },
    ]);

    return res.status(200).json({
      success: true,
      current_movie: {
        name: movie.name,
        _id: movie._id,
        genre: movie.genre,
      },
      related_movies: related_movies,
      count: related_movies.length,
    });
  } catch (error) {
    await log(
      false,
      "error",
      `Error fetching related movies: ${error.message}`,
      {
        id: id,
      }
    );
    return res.status(500).json({
      error: "Unexpected Error Occurred while fetching related movies!",
      success: false,
    });
  }
};
