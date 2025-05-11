// Update pesapalController.js to properly process IPN notifications
export const handlePesapalIPN = async (req, res) => {
  try {
    const { notification_type, order_tracking_id, merchant_reference } = req.body;
    
    // Fetch status from PesaPal API to confirm
    const token = await getAccessToken();
    
    const response = await fetch(`https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${order_tracking_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const result = await response.json();
    
    // Process payment based on status
    if (result.status === "COMPLETED") {
      // Update user subscription status in database
      await User.findOneAndUpdate(
        { referenceId: merchant_reference },
        { isSubscribed: true, subscriptionEndDate: calculateEndDate() },
        { new: true }
      );
    }
    
    res.status(200).send("IPN received and processed");
  } catch (error) {
    console.error("❌ Error handling PesaPal IPN:", error.message);
    res.status(500).send("Server error");
  }
};