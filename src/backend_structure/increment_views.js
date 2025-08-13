const log = require("../../Utilities/logger.js");
const Movies = require("../../Models/movies_model.js");
const shorten_number = require('../../Utilities/shorten_number.js');

module.exports = async function increment_views(req, res) {
  try {
    const { id } = req.params;
    const movie = await Movies.findById(id);

    if (!movie) {
      await log(false, 'error', `Movie not found: ${id}`);
      return res.status(200).json({ error: 'Movie not found!', success: false });
    }

    movie.views += 1;
    movie.views_short = shorten_number(movie.views);
    await movie.save();

    return res.status(200).json({ message: 'Success', success: true });

  } catch (error) {
    await log(false, 'error', `Error incrementing views: ${error.message}`);
    return res.status(500).json({ error: 'Unexpected Error Occured!', success: false });
  }
}