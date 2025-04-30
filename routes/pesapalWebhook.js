// routes/pesapalWebhook.js
import express from "express";
import { handlePesapalIPN } from "../controllers/pesapalController.js";

const router = express.Router();

// PesaPal webhook/IPN handler
router.post("/", handlePesapalIPN);

export default router;
