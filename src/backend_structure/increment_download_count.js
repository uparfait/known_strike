const Movies = require('../../Models/movies_model');
const log = require('../../Utilities/logger.js');
const shorten_number = require('../../Utilities/shorten_number.js');

module.exports = async function increment_download_count(req, res) {
  try {
    const { id } = req.params;
    const movie = await Movies.findById(id);

    if (!movie) {
      return res.status(200).json({ error: 'Movie not found!', success: false });
    }

    movie.download_count += 1;
    movie.download_count_short = shorten_number(movie.download_count);
    await movie.save();
    return res.status(200).json({ message: 'Download count incremented.', success: true });
    
  } catch (error) {
    await log(false, 'error', `Error incrementing download count: ${error.message}`);
    return res.status(500).json({ error: 'Unexpected Error Occured!', success: false });
  }
}