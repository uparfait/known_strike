const Genre = require("../../Models/genre_model");
const log = require("../../Utilities/logger");

module.exports = async function delete_genre(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      await log(false, "warning", "No id provided for genre");
      return res.status(200).json({
        error: "id is required",
        success: false,
      });
    }
    const genre = await Genre.findByIdAndDelete(id);
    if (!genre) {
      await log(false, "warning", `Genre not found: ${id}`);
      return res.status(200).json({
        error: "Genre not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      genre: genre,
    });
  } catch (error) {
    await log(false, "error", `Error deleting genre: ${error.message}`);
  }
}