const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");
const mongoose = require("mongoose");

module.exports = async function load_next_related_movies(req, res) {
  try {
    const { id, loaded_idx = [] } = req.body;

    if (!id) {
      await log(false, "warning", "Invalid movie ID provided", { id });
      return res.status(200).json({
        error: "Valid movie ID is required",
        success: false,
      });
    }

    if (!Array.isArray(loaded_idx)) {
      await log(false, "warning", "Invalid loaded_idx format", { loaded_idx });
      return res.status(200).json({
        error: "loaded_idx must be an array",
        success: false,
      });
    }

    const validExcludedIds = [
      new mongoose.Types.ObjectId(id),
      ...loaded_idx.map((loadedId) => new mongoose.Types.ObjectId(loadedId)),
    ];

    const movie = await Movies.findById(id).select("name genre _id");
    if (!movie) {
      await log(false, "warning", "Movie not found", { id });
      return res.status(404).json({
        error: "Movie not found",
        success: false,
      });
    }

    const pipeline = [
      {
        $match: {
          genre: movie.genre,
          _id: { $nin: validExcludedIds },
        },
      },
      { $sample: { size: 12 } },
    ];

    const related_movies = await Movies.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      current_movie: {
        name: movie.name,
        _id: movie._id,
        genre: movie.genre,
      },
      related_movies,
      count: related_movies.length,
    });
  } catch (error) {
    await log(false, "error", "Related movies loading failed", {
      error: error.message,
      stack: error.stack,
      id,
      loaded_idx,
    });
    return res.status(500).json({
      error: "An unexpected error occurred while loading related movies",
      success: false,
    });
  }
};
