const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");
const mongoose = require("mongoose");

module.exports = async function load_next_search_movie(req, res) {
  try {
    let { loaded_idx = [] } = req.body;
    const { q } = req.body;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      await log(false, "warning", "Search attempt with invalid query", {
        query: q,
      });
      return res.status(200).json({
        error: "Valid non-empty search string is required",
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

    const valid_object_idx = loaded_idx.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const clean_query = q.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
    const search_ptn = new RegExp(clean_query, "i");

    const pipeline = [
      {
        $match: {
          $and: [
            {
              $or: [
                { name: search_ptn },
                { interpreter: search_ptn },
                { genre: search_ptn },
                { display_language: search_ptn },
                { country: { $regex: search_ptn } },
              ],
            },
            { _id: { $nin: valid_object_idx } },
          ],
        },
      },
      { $sample: { size: 12 } },
    ];

    const results = await Movies.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      movies: results,
      count: results.length,
    });
  } catch (error) {
    await log(false, "error", `Search error: ${error.message}`, {
      query: q,
      loaded_idx: loaded_idx,
      stack: error.stack,
    });
    return res.status(500).json({
      error: "Unexpected Error Occurred during search!",
      success: false,
    });
  }
};
