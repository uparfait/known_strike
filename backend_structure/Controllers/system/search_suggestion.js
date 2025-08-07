const log = require("../../Utilities/logger");
const Movies = require("../../Models/movies_model");

module.exports = async function search_suggestion(req, res) {
  try {
    const { q } = req.query;
    const clean_query = q.replace(/[\\^$.*+?(){}[\]|]/g, '\\$&');
    const search_ptn = new RegExp(clean_query, "i");
    const results = await Movies.find({ name: { $regex: search_ptn }, visibility: 'show' }).limit(10);
    return res.status(200).json({ success: true, suggestions: results });
  } catch (error) {
    await log(false, "error", `Error fetching search suggestions: ${error.message}`);
    return res.status(500).json({ error: "Something got wrong!", success: false });
  }
}