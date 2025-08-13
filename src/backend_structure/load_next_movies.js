const Movies = require("../../Models/movies_model");
const log = require("../../Utilities/logger");
const mongoose = require("mongoose");

module.exports = async function load_next_movies(req, res) {
  try {
    let { loaded_idx = [] } = req.body;

    if (!Array.isArray(loaded_idx)) {
      await log(false, "warning", "Invalid loaded_idx format", { loaded_idx });
      return res.status(200).json({
        error: "loaded_idx must be an array",
        success: false,
      });
    }

    const valid_object_idx = loaded_idx.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const match_stage = { _id: { $nin: valid_object_idx } };

    const movies = await Movies.aggregate([
      { $match: match_stage },
      { $sample: { size: 12 } },
    ]);

    return res.status(200).json({
      movies,
      success: true,
      count: movies.length,
    });
  } catch (error) {
    await log(false, "error", `Error loading next movies: ${error.message}`, {
      stack: error.stack,
      loaded_idx: req.body.loaded_idx,
    });
    return res.status(500).json({
      error: "Unexpected Error Occurred while loading movies!",
      success: false,
    });
  }
};
