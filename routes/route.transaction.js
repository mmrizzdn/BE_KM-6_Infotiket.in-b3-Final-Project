const express = require("express");
const router = express.Router();

const { restrict } = require("../middleware/restrict");
const { getPaymentMethods, pay, checkPaymentStatus } = require("../controllers/transaction.controllers");

router.get("/get-payment-list", restrict, getPaymentMethods);

router.post("/pay", restrict, pay);

router.get("/check-payment-status", restrict, checkPaymentStatus);


module.exports = router;
