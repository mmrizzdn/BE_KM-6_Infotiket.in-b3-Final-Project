const express = require("express");
const router = express.Router();

const { tripayWebhook, paymentConfirmation, getTicketFromBookingId } = require("../controllers/ticket.controllers");

router.post("/webhook", tripayWebhook);

router.get("/payment-confirmation", paymentConfirmation);

router.get("/get-ticket", getTicketFromBookingId);

module.exports = router;