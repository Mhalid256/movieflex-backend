import axios from "axios";
import dotenv from "dotenv";
import User from "../models/UserModel.js"; // Assuming you have a User model to update
import { calculateEndDate } from '../utils/dateUtils.js';


dotenv.config();

const consumer_key = process.env.PESAPAL_CONSUMER_KEY;
const consumer_secret = process.env.PESAPAL_CONSUMER_SECRET;

// Helper function to get the access token from PesaPal API
const getAccessToken = async () => {
  try {
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
  } catch (error) {
    console.error("❌ Error getting PesaPal access token:", error.message);
    throw new Error("Failed to get access token");
  }
};

// Main function to handle the IPN notification
export const handlePesapalIPN = async (req, res) => {
  const { notification_type, order_tracking_id, merchant_reference } = req.body;

  try {
    console.log("Received IPN Notification:", req.body);

    // Validate the notification type
    if (notification_type !== "ORDER_COMPLETED") {
      console.log("❌ Invalid notification type:", notification_type);
      return res.status(400).send("Invalid notification type");
    }

    // Fetch the transaction status from PesaPal
    const token = await getAccessToken();
    const response = await axios.get(
      `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${order_tracking_id}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;
    console.log("Transaction status from PesaPal:", result);

    // Check if the payment was successful
    if (result.status === "COMPLETED") {
      console.log("✅ Payment completed. Updating user subscription...");

      // Find the user by merchant reference and update subscription status
      const user = await User.findOne({ referenceId: merchant_reference });
      
      if (!user) {
        console.error(`❌ User with reference ID ${merchant_reference} not found.`);
        return res.status(404).send("User not found");
      }

      // Update user subscription details
      const updatedUser = await User.findOneAndUpdate(
        { referenceId: merchant_reference },
        { isSubscribed: true, subscriptionEndDate: calculateEndDate() },
        { new: true }
      );

      console.log("✅ User subscription updated:", updatedUser);
    } else {
      console.log("❌ Payment status is not completed. Status:", result.status);
    }

    res.status(200).send("IPN received and processed successfully");
  } catch (error) {
    console.error("❌ Error processing PesaPal IPN:", error.message);
    res.status(500).send("Server error processing IPN");
  }
};
