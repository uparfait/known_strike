const log = require('../../Utilities/logger');
const Movies = require('../../Models/movies_model');

module.exports = async function delete_movie(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      await log(false, 'warning', 'Delete attempt without id');
      return res.status(200).json({ 
        error: 'id is required', 
        success: false 
      });
    }

    const movie = await Movies.findById(id);
    if (!movie) {
      await log(false, 'warning', `Delete attempt for non-existent movie: ${id}`);
      return res.status(200).json({ 
        error: 'Movie not found', 
        success: false 
      });
    }

    await Movies.findByIdAndDelete(id);

    await log(false, 'info', `Movie deleted: ${movie.name} (ID: ${id})`);
    return res.status(200).json({ 
      message: 'Movie deleted successfully', 
      success: true,
      movie: {
        name: movie.name,
        id: id
      }
    });

  } catch (error) {
    await log(false, 'error', `Error deleting movie: ${error.message}`);
    return res.status(500).json({ 
      error: 'Unexpected Error Occurred!', 
      success: false 
    });
  }
}