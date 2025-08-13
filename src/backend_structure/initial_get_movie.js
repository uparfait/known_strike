const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function initial_get_movie(req, res) {
  try {
    const movies = await Movies.aggregate([
      {
        $sample: { size: 18 },
      },
    ]);

    return res.status(200).json({ movies, success: true });
  } catch (error) {
    await log(false, "error", `Error fetching movies: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
