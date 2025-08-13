const logger = require("../../Utilities/logger.js");
const movieCommentModel = require("../../Models/movie_comment_model.js");

module.exports = async function save_movie_comment(req, res) {
  try {
    let { movie_id, user_id, comment } = req.body;

    if (!movie_id || !user_id || !comment) {
      return res.status(400).json({
        error: "All fields are required!",
        success: false,
      });
    }

    if (comment.length > 500) {
      return res.status(400).json({
        error: "Comment is too long!",
        success: false,
      });
    }
   
    const filter = /https?:\/\/[^\s]+/g;
    const filteredComment = comment.replace(filter, "[Link Removed]");
    if (filteredComment !== comment) {
      return res.status(400).json({
        error: "Links are not allowed in comments!",
        success: false,
      });
    }
    if (comment.trim() === "") {
      return res.status(400).json({
        error: "Comment cannot be empty!",
        success: false,
      });
    }

    const newComment = new movieCommentModel({
      movie_id,
      user_id,
      comment,
    });
    await newComment.save();
    return res.status(200).json({
      success: true,
      message: "Comment saved successfully!",
      comment: newComment,
    });
  } catch (error) {
    await logger(false, "error", `Error saving comment: ${error.message}`);
    return res.status(500).json({
      error: "An error occurred while saving comment",
      success: false,
    });
  }
}
