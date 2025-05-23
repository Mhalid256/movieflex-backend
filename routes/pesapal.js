// routes/pesapal.js
import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const consumer_key = process.env.PESAPAL_CONSUMER_KEY;
const consumer_secret = process.env.PESAPAL_CONSUMER_SECRET;
let access_token = null;

// Step 1: Get OAuth2 access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString("base64");

  try {
    const response = await axios.post(
      "https://pay.pesapal.com/v3/api/Auth/RequestToken",
      {},
      {
        headers: {
          "Authorization": `Basic ${auth}`,
        },
      }
    );

    console.log("✅ Access Token retrieved:", response.data.token);
    return response.data.token;
  } catch (error) {
    console.error("❌ Failed to get PesaPal access token:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with PesaPal");
  }
};

// Step 2: Create Order
router.post("/subscribe", async (req, res) => {
  try {
    const token = await getAccessToken();
    access_token = token;

    const callbackUrl = "https://movieflex-frontend-1v9k.vercel.app/payment-confirmation"; // fixed double slashes

    const order = {
      id: uuidv4(),
      currency: "UGX",
      amount: "5000",
      description: "MovieFlex Subscription",
      callback_url: callbackUrl,
      notification_id: "", // Optional
      billing_address: {
        email_address: req.body.email,
        phone_number: req.body.phone,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        line_1: "N/A",
        city: "Kampala",
        state: "Kampala",
        postal_code: "256",
        country_code: "UG",
      }
    };

    console.log("🧾 Order being sent to PesaPal:", JSON.stringify(order, null, 2));

    const response = await axios.post(
      "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest",
      order,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ PesaPal Response:", response.data);

    res.status(200).json(response.data.redirect_url);

  } catch (error) {
    console.error("❌ PesaPal Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

export default router;
