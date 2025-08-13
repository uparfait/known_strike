const logger = require('../../Utilities/logger.js');
const MovieComments = require('../../Models/movie_comment_model.js');
const mongoose = require('mongoose');

module.exports = async function get_movie_comments(req, res) {
    try {
        const { movie_id } = req.params;

        if (!movie_id || !mongoose.Types.ObjectId.isValid(movie_id)) {
            await logger(false, "warning", "Invalid movie_id provided");
            return res.status(400).json({
                error: "Valid movie_id is required",
                success: false,
            });
        }
        const comments = await MovieComments.find({ movie_id: mongoose.Types.ObjectId(movie_id) })
            .populate('user_id', 'username')
            .sort({ created_at: -1 });

        return res.status(200).json({
            success: true,
            comments: comments,
            count: comments.length,
        });
    } catch(error) {
        await logger(false, "error", `Error fetching comments: ${error.message}`);
        return res.status(500).json({
            error: "An error occurred while fetching comments",
            success: false,
        });
    }
}
