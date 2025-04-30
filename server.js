import pesapalWebhookRoutes from "./routes/pesapalWebhook.js";
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Route imports
const movieRoutes = require("./routes/movies");
const tmdbRoutes = require("./routes/tmdbRoutes");
const pesapalRoutes = require("./routes/pesapal");

const app = express();


app.use("/api/pesapal-webhook", pesapalWebhookRoutes);


// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", movieRoutes);
app.use("/api/movies", tmdbRoutes);
app.use("/api/payments", pesapalRoutes);

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

// Example root route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
