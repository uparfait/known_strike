const log = require("../../Utilities/logger.js");
const Genre = require("../../Models/genre_model.js");

module.exports = async function get_all_genres(req, res) {
  try {
    const genres = await Genre.find({});
    return res.status(200).json({ genres, success: true });
  } catch (error) {
    await log(false, "error", `Error fetching genres: ${error.message}`);
  } 
}