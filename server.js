// server.js

import express from "express";
const app = express();

import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import movieRoutes from "./routes/movies.js";
import tmdbRoutes from "./routes/tmdbRoutes.js";
import pesapalRoutes from "./routes/pesapal.js";
import pesapalWebhookRoutes from "./routes/pesapalWebhook.js";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";
import winston from "winston";

// Load environment variables
dotenv.config();

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Middleware
app.use(cors());
app.use(express.json());

// CORS options
const corsOptions = {
  origin: (process.env.ALLOWED_ORIGINS || "").split(","),
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

// Cache setup
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  res.originalSend = res.json;
  res.json = (body) => {
    cache.set(key, body);
    res.originalSend(body);
  };
  next();
};

// Apply caching to TMDB routes
app.use("/api/movies", cacheMiddleware);

// API Routes
app.use("/api/pesapal-webhook", pesapalWebhookRoutes); // Webhook route
app.use("/api", movieRoutes);                          // Movie routes
app.use("/api/movies", tmdbRoutes);                    // TMDB routes
app.use("/api/payments", pesapalRoutes);               // PesaPal routes (includes /subscribe)

// Rate limiter for payments
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use("/api/payments/", apiLimiter);

// MongoDB connection with retry logic
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 100,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

// Root route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  res.status(err.status || 500).json({
    error: {
      message: err.message,
    },
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
