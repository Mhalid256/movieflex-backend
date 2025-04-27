const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  tmdbId: Number,
  title: String,
  genre_ids: [Number],
  posterPath: String,
  overview: String,
  releaseDate: String,
});

module.exports = mongoose.model("Movie", movieSchema);
