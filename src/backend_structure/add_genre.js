const Genre = require("../../Models/genre_model");
const log = require("../../Utilities/logger");

module.exports = async function add_genre(req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      await log(false, "warning", "No name provided for genre");
      return res.status(200).json({
        error: "name is required",
        success: false,
      });
    }
    const existingGenre = await Genre.findOne({ name: name });
    if (existingGenre) {
      await log(false, "warning", `Genre already exists: ${name}`);
      return res.status(200).json({
        error: "Genre already exists",
        success: false,
      });
    }
    const newGenre = new Genre({ name: name });
    await newGenre.save();
    return res.status(200).json({
      success: true,
      genre: newGenre,
    });
  } catch (error) {
    await log(false, "error", `Error adding genre: ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};
