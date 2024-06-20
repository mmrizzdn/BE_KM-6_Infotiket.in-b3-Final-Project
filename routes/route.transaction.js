const express = require("express");
const router = express.Router();

const { restrict } = require("../middleware/restrict");
const { getPaymentMethods, pay, checkPaymentStatus } = require("../controllers/transaction.controllers");

// router api penumpang
router.get("/get-payment-list", restrict, getPaymentMethods);

module.exports = router;
