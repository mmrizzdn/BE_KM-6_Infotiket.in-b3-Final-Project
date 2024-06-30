const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");
const { ClosedTransaction } = require("tripay-node/closed-transaction");
const { Merchant } = require("tripay-node/merchant");
const crypto = require("crypto");
require("dotenv").config();

const tripayTransaction = new ClosedTransaction({
  apiToken: process.env.TRIPAY_API_TOKEN,
  merchantCode: process.env.TRIPAY_MERCHANT_CODE,
  privateKey: process.env.TRIPAY_PRIVATE_KEY,
  sandbox: true,
});

const tripayMerchant = new Merchant({
  apiToken: process.env.TRIPAY_API_TOKEN,
  sandbox: true,
});

function generateSignature(merchantCode, merchantRef, amount, privateKey) {
  return crypto
    .createHmac("sha256", privateKey)
    .update(`${merchantCode}${merchantRef}${amount}`)
    .digest("hex");
}

module.exports = {
  getPaymentMethods: async (req, res) => {
    try {
      const methods = await tripayMerchant.paymentChannel();
      res.json(methods);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Terjadi kesalahan saat mengambil metode pembayaran." });
    }
  },

  pay: async (req, res, next) => {
    const { booking_id, payment_method } = req.query;
    const first_name = req.body.first_name || req.user.first_name;
    const last_name = req.body.last_name || req.user.last_name;

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

      let returnSchedule = null;
      if (booking.return_schedule_id) {
        returnSchedule = await prisma.schedule.findUnique({
          where: { id: booking.return_schedule_id },
        });

        if (!returnSchedule) {
          return res
            .status(404)
            .json({ error: "Return Schedule tidak ditemukan" });
        }
      }

      const ticketPrice = booking.total_passenger * schedule.price;
      const returnTicketPrice = returnSchedule
        ? booking.total_passenger * returnSchedule.price
        : 0;
      const totalTicketPrice = ticketPrice + returnTicketPrice;
      const adminTax = totalTicketPrice * 0.02;
      const ppn = totalTicketPrice * 0.1;
      const totalPrice = totalTicketPrice + adminTax + ppn;

      // Menambahkan item pesanan untuk jadwal keberangkatan
      tripayTransaction.addOrderItem({
        name: schedule.flight_number,
        price: schedule.price,
        quantity: booking.total_passenger,
        sku: schedule.id.toString(),
        subtotal: ticketPrice,
        image_url: "http://image.com",
        product_url: "http://product.com",
      });
      tripayTransaction.addOrderItem({
        name: "pajak admin",
        price: adminTax,
        quantity: 1,
        sku: schedule.id.toString(),
        subtotal: adminTax,
        image_url: "http://image.com",
        product_url: "http://product.com",
      });
      tripayTransaction.addOrderItem({
        name: "pajak ppn",
        price: ppn,
        quantity: 1,
        sku: schedule.id.toString(),
        subtotal: ppn,
        image_url: "http://image.com",
        product_url: "http://product.com",
      });

      // Menambahkan item pesanan untuk jadwal kepulangan (jika ada)
      if (returnSchedule) {
        tripayTransaction.addOrderItem({
          name: returnSchedule.flight_number,
          price: returnSchedule.price,
          quantity: booking.total_passenger,
          sku: returnSchedule.id.toString(),
          subtotal: returnTicketPrice,
          image_url: "http://image.com",
          product_url: "http://product.com",
        });
      }

      // Membuat merchant reference yang unik
      const merchantRef = `ORDER-${booking_id}-${Date.now()}`;
      const signature = generateSignature(
        process.env.TRIPAY_MERCHANT_CODE,
        merchantRef,
        totalPrice,
        process.env.TRIPAY_PRIVATE_KEY
      );

      // Membuat transaksi
      const transaction = await tripayTransaction.create({
        amount: totalPrice,
        method: payment_method,
        merchant_ref: merchantRef,
        customer_name: `${booking.user.first_name} ${booking.user.last_name}`,
        customer_email: booking.user.email,
        customer_phone: booking.user.phone_number,
        expired_time: Math.floor(Date.now() / 1000) + 3600,
        callback_url: `${process.env.DOMAIN}/api/v1/webhook`,
        return_url: `http://localhost:5173/konfirmasi-pembayaran`,
        signature,
      });

      await prisma.payment.create({
        data: {
          booking_id: booking.id,
          payment_date: new Date(),
          amount: totalPrice,
          payment_method,
          status: "PENDING",
          merchant_ref: transaction.merchant_ref,
          admin_tax: adminTax,
          ppn_tax: ppn,
        },
      });

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna Login",
          message: `Hai ${user.first_name} ${user.last_name}, selamat, anda sudah melakukan transaksi. Segera lunasi pembayaran anda!`,
          user_id: user.id,
        },
      });

      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notification);

      res.json({
        transaction,
        ticket_price: totalTicketPrice,
        admin_tax: adminTax,
        ppn,
        total_price: totalPrice,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Terjadi kesalahan saat memproses pembayaran." });
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
      res
        .status(500)
        .json({ error: "Terjadi kesalahan saat memeriksa status pembayaran." });
    }
  },

  getPaymentsByUserId: async (req, res, next) => {
    try {
      const { first_name, last_name } = req.body;
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User ID tidak ditemukan atau anda belum login",
          data: null,
        });
      }

      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            user_id: userId,
          },
        },
        include: {
          booking: true,
        },
      });

      if (!payments || payments.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Tidak ada pembayaran yang ditemukan untuk user ini",
          data: null,
        });
      }

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna berhasil mendapatkan pembayaran",
          message: `Hai ${user.first_name} ${user.last_name}, anda telah berhasil mendapatkan pembayaran!`,
          user_id: user.id,
        },
      });
      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notification);

      return res.status(200).json({
        status: true,
        message: "Berhasil mendapatkan pembayaran",
        data: payments,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Terjadi kesalahan saat mendapatkan pembayaran",
        data: null,
      });
    }
  },

  getPendingPaymentsByUserId: async (req, res, next) => {
    try {
      const { first_name, last_name } = req.body;
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User ID tidak ditemukan atau anda belum login",
          data: null,
        });
      }

      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            user_id: userId,
          },
          status: "PENDING",
        },
        include: {
          booking: true,
        },
      });

      if (!payments || payments.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Tidak ada pembayaran yang ditemukan untuk user ini",
          data: null,
        });
      }

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna berhasil mendapatkan pembayaran yang pending",
          message: `Hai ${user.first_name} ${user.last_name}, anda telah berhasil mendapatkan pembayaran yang pending!`,
          user_id: user.id,
        },
      });
      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notification);

      return res.status(200).json({
        status: true,
        message: "Berhasil mendapatkan pembayaran yang pending",
        data: payments,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Terjadi kesalahan saat mendapatkan pembayaran yang pending",
        data: null,
      });
    }
  },
};
