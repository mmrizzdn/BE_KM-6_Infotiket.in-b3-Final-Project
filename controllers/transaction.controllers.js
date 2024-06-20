const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { ClosedTransaction } = require('tripay-node/closed-transaction'); 

const tripay = new ClosedTransaction({
  apiKey: 'DEV-icNoDdrKBqe5wAp7LdROtrg0jzPhgcyd1vbKkeh1',
  merchantCode: 'T32335',
  privateKey: 'LvgVc-yIoY5-zaRmD-c5qHr-E2Ayr'
});

module.exports = {
  getPaymentMethods: async (req, res) => {
    try {
      const methods = await tripay.getPaymentChannels();
      res.json(methods);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil metode pembayaran." });
    }
  },

  pay: async (req, res, next) => {
    const { booking_id, payment_method } = req.query;

    try {
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(booking_id) },
        include: { user: true, schedule: true },
      });

      if (!booking) {
        return res.status(404).json({ error: "Booking tidak ditemukan" });
      }

      const amount = booking.total_passenger * booking.schedule.price;
      const transaction = await tripay.createTransaction({
        method: payment_method,
        merchant_ref: uuidv4(),
        amount,
        customer_name: booking.user.name,
        customer_email: booking.user.email,
        customer_phone: booking.user.phone,
        order_items: [
          {
            name: booking.schedule.name,
            price: booking.schedule.price,
            quantity: booking.total_passenger,
            subtotal: amount,
          },
        ],
        callback_url: "YOUR_CALLBACK_URL",
        return_url: "YOUR_RETURN_URL",
      });

      await prisma.payment.create({
        data: {
          booking_id: booking.id,
          payment_date: new Date(),
          amount,
          payment_method,
          status: "PENDING",
          merchant_ref: transaction.merchant_ref,
        },
      });

      res.json(transaction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Terjadi kesalahan saat memproses pembayaran." });
    }
  },

  checkPaymentStatus: async (req, res, next) => {
    const { merchant_ref } = req.query;

    try {
      const payment = await prisma.payment.findUnique({
        where: { merchant_ref },
      });

      if (!payment) {
        return res.status(404).json({ error: "Pembayaran tidak ditemukan" });
      }

      const status = await tripay.getTransactionStatus({ reference: merchant_ref });

      res.json({ status: status.status });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Terjadi kesalahan saat memeriksa status pembayaran." });
    }
  },
};
