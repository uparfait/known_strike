
const log = require('../../Utilities/logger');
const Movies = require('../../Models/movies_model');

module.exports = async function find_by_genre(req, res) {
  try {
    const { genre } = req.params;
    const movies = await Movies.find({ genre: genre });
    return res.status(200).json({ movies, success: true });
  } catch (error) {
    await log(false, 'error', `Error finding movies by genre: ${error.message}`);
    return res.status(500).json({ error: 'Unexpected Error Occured!', success: false });
  }
}
