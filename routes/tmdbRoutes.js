// routes/tmdbRoutes.js
import express from "express";
import axios from "axios";

const router = express.Router();

const TMDB_API_KEY = "7f602bb21d9a23e77e110e48883aebf3"; // replace with your key

router.get("/genre/:id", async (req, res) => {
  const genreId = req.params.id;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie`,
      {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: genreId,
        },
      }
    );
    res.json(response.data.results);
  } catch (err) {
    console.error("❌ TMDB Genre Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch movies by genre" });
  }
});

export default router;
