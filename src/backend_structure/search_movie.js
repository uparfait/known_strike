const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function search_movie(req, res) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      await log(false, "warning", "Search attempt with invalid query");
      return res.status(200).json({
        error: "Valid q string is required",
        success: false,
      });
    }

    const clean_query = q.replace(/[\\^$.*+?(){}[\]|]/g, "\\$&");
    const search_ptn = new RegExp(clean_query, "i");

    const results = await Movies.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: search_ptn } },
            { interpreter: { $regex: search_ptn } },
            { genre: { $regex: search_ptn } },
            { display_language: { $regex: search_ptn } },
            { country: { $regex: search_ptn } },
          ],
        },
      },
      { $sample: { size: 18 } },
    ]);

    return res.status(200).json({
      success: true,
      movies: results,
      count: results.length,
    });
  } catch (error) {
    await log(false, "error", `Search error: ${error.message}`);
    return res.status(500).json({
      error: "Unexpected Error Occurred during search!",
      success: false,
    });
  }
};
