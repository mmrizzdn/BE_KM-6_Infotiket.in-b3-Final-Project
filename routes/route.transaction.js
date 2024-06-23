const express = require("express");
const router = express.Router();

const { restrict } = require("../middleware/restrict");
const { getPaymentMethods, pay, checkPaymentStatus, getPaymentsByUserId, getPendingPaymentsByUserId } = require("../controllers/transaction.controllers");

router.get("/get-payment-list", restrict, getPaymentMethods);

router.post("/pay", restrict, pay);

router.get("/check-payment-status", restrict, checkPaymentStatus);

router.get("/get-payments", restrict, getPaymentsByUserId);

router.get("/get-pending-payments", restrict, getPendingPaymentsByUserId);


module.exports = router;
