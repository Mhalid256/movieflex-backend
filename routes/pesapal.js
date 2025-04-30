const express = require("express");
const axios = require("axios");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const consumer_key = process.env.PESAPAL_CONSUMER_KEY;
const consumer_secret = process.env.PESAPAL_CONSUMER_SECRET;
let access_token = null;

// Step 1: Get OAuth2 access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString("base64");
  const response = await axios.post(
    "https://pay.pesapal.com/v3/api/Auth/RequestToken",
    {},
    {
      headers: {
        "Authorization": `Basic ${auth}`,
      },
    }
  );
  return response.data.token;
};

// Step 2: Create Order
router.post("/subscribe", async (req, res) => {
  try {
    const token = await getAccessToken();
    access_token = token;

    const callbackUrl = "http://localhost:3000/payment-confirmation"; // update to your frontend

    const order = {
      id: uuidv4(),
      currency: "UGX",
      amount: "5000", // or your subscription price
      description: "MovieFlex Subscription",
      callback_url: callbackUrl,
      notification_id: "", // Optional for webhook
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

    res.status(200).json(response.data.redirect_url); // This is the payment link

  } catch (error) {
    console.error("PesaPal Error:", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

module.exports = router;
