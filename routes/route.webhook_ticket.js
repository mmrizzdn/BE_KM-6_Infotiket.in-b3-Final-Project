const express = require("express");
const router = express.Router();

const { restrict } = require("../middleware/restrict");
const { tripayWebhook, paymentConfirmation, getTicketFromBookingId, getAllTicketsByUserId} = require("../controllers/ticket.controllers");

router.post("/webhook", tripayWebhook);

router.get("/payment-confirmation", paymentConfirmation);

router.get("/get-ticket", restrict, getTicketFromBookingId);

router.get("/get-all-tickets", restrict, getAllTicketsByUserId);


module.exports = router;