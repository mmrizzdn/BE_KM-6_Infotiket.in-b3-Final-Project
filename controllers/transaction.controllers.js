const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { ClosedTransaction } = require('tripay-node/closed-transaction');
const { Merchant } = require('tripay-node/merchant');

const tripayTransaction = new ClosedTransaction({
  apiToken: 'DEV-icNoDdrKBqe5wAp7LdROtrg0jzPhgcyd1vbKkeh1',
  merchantCode: 'T32335',
  privateKey: 'LvgVc-yIoY5-zaRmD-c5qHr-E2Ayr',
  sandbox: true  // Mengaktifkan mode sandbox
});

const tripayMerchant = new Merchant({
  apiToken: 'DEV-icNoDdrKBqe5wAp7LdROtrg0jzPhgcyd1vbKkeh1',
  sandbox: true  // Mengaktifkan mode sandbox
});

module.exports = {
  getPaymentMethods: async (req, res) => {
    try {
      const methods = await tripayMerchant.paymentChannel();
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
        include: { user: true },
      });

      if (!booking) {
        return res.status(404).json({ error: "Booking tidak ditemukan" });
      }

      const schedule = await prisma.schedule.findUnique({
        where: { id: booking.schedule_id },
      });

      if (!schedule) {
        return res.status(404).json({ error: "Schedule tidak ditemukan" });
      }

      const amount = booking.total_passenger * schedule.price;

      // Menambahkan item pesanan
      tripayTransaction.addOrderItem({
        name: schedule.flight_number,
        price: schedule.price,
        quantity: booking.total_passenger,
        sku: schedule.id.toString(),
        subtotal: amount,
        image_url: 'http://image.com',
        product_url: 'http://product.com',
      });

      // Membuat transaksi
      const transaction = await tripayTransaction.create({
        amount,
        method: payment_method,
        merchant_ref: uuidv4(),
        customer_name: `${booking.user.first_name} ${booking.user.last_name}`,
        customer_email: booking.user.email,
        customer_phone: '0823246821838291',
        expired_time: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
        callback_url: "http://localhost:3000/api/v1/webhook",
        return_url: "http://localhost:3000/api/v1/payment-confirmation",
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
      const payment = await prisma.payment.findFirst({
        where: { merchant_ref },
      });

      if (!payment) {
        return res.status(404).json({ error: "Pembayaran tidak ditemukan" });
      }

      return res.json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Terjadi kesalahan saat memeriksa status pembayaran." });
    }
  },
};
