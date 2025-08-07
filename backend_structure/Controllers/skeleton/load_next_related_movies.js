
const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function load_next_related_movies(req, res) {
  try {
    const { id, loaded_idx = [] } = req.body;


    if (!id) {
      await log(false, "warning", "No id provided for related movies");
      return res.status(200).json({
        error: "id is required",
        success: false,
      });
    }

    if (!Array.isArray(loaded_idx)) {
      await log(false, "warning", "Invalid loaded_idx format");
      return res.status(200).json({
        error: "loaded_idx must be an array",
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
          _id: { 
            $nin: [movie._id, ...loaded_idx]
          },
        },
      },
      { $sample: { size: 12 } },
    ]);

    return res.status(200).json({
      success: true,
      current_movie: {
        name: movie.name,
        _id: movie._id,
        genre: movie.genre,
      },
      related_movies: related_movies,
      count: related_movies.length
    });
  } catch (error) {
    await log(false, "error", `Related movies error: ${error.message}`, {
      id: id,
      loaded_idx: loaded_idx,
    });
    return res.status(500).json({
      error: "Unexpected Error Occurred while loading related movies!",
      success: false,
    });
  }
};
