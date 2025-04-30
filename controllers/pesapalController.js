export const handlePesapalIPN = async (req, res) => {
    try {
      const { notification_type, order_tracking_id, merchant_reference } = req.body;
  
      console.log("📬 IPN Received:", req.body);
  
      // Fetch status from PesaPal API to confirm
      const token = await getAccessToken(); // Your function to get OAuth2 token
  
      const response = await fetch(`https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${order_tracking_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const result = await response.json();
  
      console.log("✅ Payment status from PesaPal:", result);
  
      // TODO: Match merchant_reference to a user in DB and update their subscription
      // Example: await User.updateOne({ referenceId: merchant_reference }, { isSubscribed: true });
  
      res.status(200).send("IPN received and processed");
    } catch (error) {
      console.error("❌ Error handling PesaPal IPN:", error.message);
      res.status(500).send("Server error");
    }
  };
  