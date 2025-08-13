const logger = require("../../Utilities/logger.js");
const MovieComments = require("../../Models/movie_comment_model.js");

module.exports = async function delete_comment(req, res) {
  try {
    const { id } = req.params;

    if (!id || !user_id) {
      return res.status(200).json({
        error: "Invalid request!",
        success: false,
      });
    }

    const comment = await MovieComments.findById(id);
    if (!comment) {
      return res.status(200).json({
        error: "Comment not found!",
        success: false,
      });
    }

    await MovieComments.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ status: true, message: "Comment deleted successfully" });
  } catch (error) {
    await logger(false, "error", `Error in delete_comment: ${error.message}`);
    return res.status(500).json({
      error: "An error occurred while deleting the comment",
      success: false,
    });
  }
};
