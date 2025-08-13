const logger = require("../../Utilities/logger.js");
const MovieComments = require("../../Models/movie_comment_model.js");

module.exports = async function like_or_dislike_comment(req, res) {
  try {
    const { comment_id, user_id, action } = req.body;

    if (!comment_id || !user_id || !action) {
      return res.status(400).json({
        error: "Invalid request!",
        success: false,
      });
    }

    const validActions = ["like", "dislike"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        error: "Invalid action specified!",
        success: false,
      });
    }

    const comment = await MovieComments.findById(comment_id);
    if (!comment) {
      return res.status(404).json({
        error: "Comment not found!",
        success: false,
      });
    }

    if (action === "like") {
      if (comment.liked_by.includes(user_id)) {
        comment.likes -= 1;
        comment.liked_by = comment.liked_by.filter(
          (id) => id.toString() !== user_id.toString()
        );
        await comment.save();
        return res.status(200).json({ status: true, message: "Disliked" });
      }
      comment.likes += 1;
      comment.liked_by.push(user_id);
      await comment.save();
      return res.status(200).json({ status: true, message: "Liked" });
    } else if (action === "dislike") {
      if (comment.disliked_by.includes(user_id)) {
        comment.dislikes -= 1;
        comment.disliked_by = comment.disliked_by.filter(
          (id) => id.toString() !== user_id.toString()
        );
        await comment.save();
        return res.status(200).json({ status: true, message: "Undisliked" });
      }
      comment.dislikes += 1;
      comment.disliked_by.push(user_id);
      await comment.save();
      return res.status(200).json({ status: true, message: "Disliked" });
    }
    return res.status(200).json({ status: false, message: "No action performed" });
  } catch (error) {
    await logger(false, "error", `Error in like/dislike: ${error.message}`);
    return res.status(500).json({
      error: "An error occurred while processing comment action",
      success: false,
    });
  }
}
