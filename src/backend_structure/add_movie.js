const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");
const shorten_number = require("../../Utilities/shorten_number");
const check_url_availability = require("../../Utilities/check_url_availability");
const generate_hex_id = require("../../Utilities/generate_hex_id");

module.exports = async function add_movie(req, res) {
  try {
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
      visibility,
      description,
      country
    } = req.body;

    const url_list = [download_url, watch_url, thumbnail_image];
    const url_availability = await check_url_availability(url_list);

    const is_any_movie = await Movies.find({
      $or: [
        { download_url },
        { watch_url },
        { thumbnail_image },
        { name }
      ],
    });

    if (is_any_movie.length > 0) {
      await log(false, "warning", "Movie with same urls already exists or name");
      return res.status(200).json({
        error: "Movie with same urls already exists or name",
        movie: is_any_movie[0],
        success: false,
      });
    }

    if (url_availability !== true) {
      return res.status(200).json({
        error: "One or more urls not found! 404",
        success: false,
        failed_urls: url_availability,
      });
    }

    let movie_obj = req.body;

    const shortened = {
      views_short: shorten_number(views),
      download_count_short: shorten_number(download_count)
    };

    
  if(is_serie && (!linked_serie || linked_serie === "" || linked_serie === null)) { 
    movie_obj.linked_serie = `${generate_hex_id()}-${generate_hex_id()}`;

  }

    movie_obj = { ...movie_obj, ...shortened };

    const new_movie = new Movies(movie_obj);
    await new_movie.save();

    await log(false, "info", `New movie added: ${name}`);
    return res
      .status(200)
      .json({ message: "Movie added successfully", success: true });
  } catch (error) {
    await log(false, "error", `Error adding movie: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
