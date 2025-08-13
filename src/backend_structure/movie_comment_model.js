const mongoose = require("mongoose");

const movie_comment_schema = new mongoose.Schema(
  {
    movie_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "movies",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    comment: { type: String, required: true, minlength: 1, maxlength: 500 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    disliked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const MovieComment = mongoose.model("movie_comments", movie_comment_schema);
module.exports = MovieComment;
