const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");
const shorten_number = require("../../Utilities/shorten_number");
const check_url_availability = require("../../Utilities/check_url_availability");
const generate_hex_id = require("../../Utilities/generate_hex_id");

module.exports = async function update_movie(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      genre,
      download_url,
      watch_url,
      thumbnail_image,
      release_date,
      is_interpreted,
      interpreter,
      display_language,
      is_serie,
      linked_serie,
      views,
      download_count,
      country,
      visibility,
    } = req.body;

    const existing_movie = await Movies.findById(id);
    if (!existing_movie) {
      return res.status(200).json({
        error: "Movie not found!",
        success: false,
      });
    }

    const url_list = [download_url, watch_url, thumbnail_image];
    const url_availability = await check_url_availability(url_list);

    if (url_availability !== true) {
      return res.status(200).json({
        error: "One or more urls not found! 404",
        success: false,
        failed_urls: url_availability,
      });
    }

    let movie_obj = req.body;

    if (
      is_serie &&
      (!linked_serie || linked_serie === "" || linked_serie === null)
    ) {
      movie_obj.linked_serie = `${generate_hex_id()}-${generate_hex_id()}`;
    }

    const shortened = {
      views_short: shorten_number(views),
      download_count_short: shorten_number(download_count),
    };

    movie_obj = { ...movie_obj, ...shortened };

    const updated_movie = await Movies.findByIdAndUpdate(id, movie_obj, {
      new: true,
    });

    await log(false, "info", `Movie updated: ${name}`);
    return res.status(200).json({
      message: "Movie updated successfully",
      success: true,
      movie: updated_movie,
    });
  } catch (error) {
    await log(false, "error", `Error updating movie: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
