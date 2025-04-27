const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express(); // define the Express app before using it
const tmdbRoutes = require("./routes/tmdbRoutes");
app.use("/api/movies", tmdbRoutes); // this adds to /api/movies/genre/:id


// Middleware
app.use(cors());
app.use(express.json());

const movieRoutes = require("./routes/movies");
app.use("/api", movieRoutes);

// ✅ FIXED: Only declare PORT once
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://techmhalid:Mhalid%40256@netflix.djsruak.mongodb.net/Netflix?retryWrites=true&w=majority&appName=Netflix",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    }
  )
  .then(() => {
    console.log("✅ DB Connection Successful");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });

// Example route
app.get("/", (req, res) => {
  res.send("API is working!");
});
