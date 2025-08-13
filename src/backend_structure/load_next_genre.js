const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");
const mongoose = require("mongoose");

module.exports = async function load_next_genre(req, res) {
  try {
    let { loaded_idx = [] } = req.body;
    let { genre } = req.body;

    if (!genre || typeof genre !== "string") {
      await log(false, "warning", "Genre search attempt with invalid genre");
      return res.status(200).json({
        error: "Valid genre string is required",
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

    if (loaded_idx.length === 0) {
      const all_movies = await Movies.aggregate([
        { $match: { genre: { $regex: new RegExp(`^${genre}$`, "i") } } },
        { $sample: { size: 12 } },
      ]);
      return res.status(200).json({
        success: true,
        movies: all_movies,
        count: all_movies.length,
      });
    }

    let obj_id_array = [];
    if (loaded_idx.length > 0) {
      obj_id_array = loaded_idx
        .map((id) => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (e) {
            return null;
          }
        })
        .filter((id) => id !== null);
    }
  
    const base_match = { _id: { $nin: obj_id_array } };

    genre = genre.trim().toLowerCase();

    if (genre === "popular") {
      const popular_movies = await Movies.aggregate([
        { $match: base_match },
        { $sort: { views: -1 } },
        { $limit: 12 },
      ]);

      return res.status(200).json({
        success: true,
        movies: popular_movies,
        count: popular_movies.length,
      });
    }

    if (genre === "all") {
      const all_movies = await Movies.aggregate([
        { $match: base_match },
        { $sample: { size: 12 } },
      ]);
      return res.status(200).json({
        success: true,
        movies: all_movies,
        count: all_movies.length,
      });
    }

    const genre_match = {
      ...base_match,
      genre: { $regex: new RegExp(`^${genre}$`, "i") },
    };

    const results = await Movies.aggregate([
      { $match: genre_match },
      { $sample: { size: 12 } },
    ]);

    return res.status(200).json({
      success: true,
      movies: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error in load_next_genre:", error);
    await log(false, "error", `Genre search error: ${error.message}`, {
      genre: genre,
      loaded_idx: loaded_idx,
      stack: error.stack,
    });
    return res.status(500).json({
      error: "Unexpected Error Occurred during genre search!",
      success: false,
    });
  }
};
