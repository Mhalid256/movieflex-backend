import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import movieRoutes from "./routes/movies.js";
import tmdbRoutes from "./routes/tmdbRoutes.js";
import pesapalRoutes from "./routes/pesapal.js";
import pesapalWebhookRoutes from "./routes/pesapalWebhook.js";

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Webhook route
app.use("/api/pesapal-webhook", pesapalWebhookRoutes);

// Subscription payment endpoint
app.post("/api/payments/subscribe", async (req, res) => {
  try {
    const { amount, description, email, phoneNumber, firstName, lastName } = req.body;

    // Placeholder for actual PesaPal API integration
    const pesapalResponse = await somePesaPalApiCall({
      amount,
      description,
      email,
      phoneNumber,
      firstName,
      lastName,
    });

    if (pesapalResponse.redirect_url) {
      res.json({ redirect_url: pesapalResponse.redirect_url });
    } else {
      res.status(500).json({ error: "Failed to generate subscription URL." });
    }
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "An error occurred while processing the subscription." });
  }
});

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

// Root route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
