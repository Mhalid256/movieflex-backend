const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie"); // Adjust if you saved your schema elsewhere

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const connectDB = async () => {
  await mongoose.connect("your_mongodb_connection_string");
};

const fetchAndSaveMovies = async () => {
  const genresRes = await axios.get(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
  const genres = genresRes.data.genres;

  for (let genre of genres) {
    const moviesRes = await axios.get(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre.id}`);
    const movies = moviesRes.data.results;

    for (let movie of movies) {
      const existing = await Movie.findOne({ tmdbId: movie.id });
      if (!existing) {
        await Movie.create({
          tmdbId: movie.id,
          title: movie.title,
          genre_ids: movie.genre_ids,
          posterPath: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          overview: movie.overview,
          releaseDate: movie.release_date,
        });
      }
    }
  }

  console.log("✅ Movies fetched and stored!");
};

(async () => {
  await connectDB();
  await fetchAndSaveMovies();
  process.exit();
})();
