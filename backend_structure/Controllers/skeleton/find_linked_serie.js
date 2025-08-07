
const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function find_linked_serie(req, res) {
  try {
    const { id, linked_serie } = req.params;

    const linked_series = await Movies.find({
      $or: [{ linked_serie: linked_serie }, { _id: {
        $ne: id
      } }],
    });

    return res.status(200).json({ linked_series, success: true });
  } catch (error) {
    await log(false, "error", `Error finding linked serie: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Unexpected Error Occured!", success: false });
  }
};
