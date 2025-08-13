const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function find_movie_by_id(req, res) {
  try {
    const { id } = req.params;

    const movie = await Movies.findById(id);
    if (!movie) {
      await log(false, "warning", `Movie not found: ${id}`);
      return res.status(200).json({ error: "Movie not found", success: false });
    }

    return res.status(200).json({ movie, success: true });
  } catch (error) {
    await log(false, "error", `Error finding movie: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
