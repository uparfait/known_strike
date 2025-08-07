
const Movies = require('../../Models/movies_model');
const log = require('../../Utilities/logger');

module.exports = async function load_next_movies(req, res) {
  try {
    const { loaded_idx = [] } = req.body;

    const movies = await Movies.aggregate([
      {
        $match: {
          _id: { $nin: loaded_idx }
        }
      },
      { $sample: { size: 12 } }
    ]);

    return res.status(200).json({ movies, success: true });
  } catch (error) {
    await log(false, 'error', `Error loading next movies: ${error.message}`);
    return res.status(500).json({ error: 'Unexpected Error Occured!', success: false });
  }
}
