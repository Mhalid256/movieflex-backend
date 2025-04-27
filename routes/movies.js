const express = require("express");
const router = express.Router();

const newlyReleasedMovies = [
  { id: 1, title: "Stranger Things", imageUrl: "https://yourserver.com/images/stranger-things.jpg" },
  { id: 2, title: "Money Heist", imageUrl: "https://yourserver.com/images/money-heist.jpg" },
];

// Change to handle /api/movies instead of /newly-released
router.get("/movies", (req, res) => {
  res.json(newlyReleasedMovies); // Sends the movie list with title and imageUrl
});

module.exports = router;
