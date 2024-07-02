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
        include: { user: true, passengers: true },
      });
  
      if (!booking) {
        return res.status(404).json({ error: "Booking tidak ditemukan" });
      }
  
      const user = booking.user;
  
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
  
      // Menghitung harga berdasarkan kategori penumpang
      let adultCount = 0;
      let childCount = 0;
      let infantCount = 0;
      booking.passengers.forEach(passenger => {
        if (passenger.type === "Dewasa") adultCount++;
        if (passenger.type === "Anak") childCount++;
        if (passenger.type === "Bayi") infantCount++;
      });

      const adultPrice = schedule.price * adultCount;
      const childPrice = schedule.price * 0.75 * childCount;
      const infantPrice = schedule.price * 0.5 * infantCount;
      console.log(adultPrice, childPrice, infantPrice);

      const totalPassengerPrice = adultPrice + childPrice + infantPrice;
      console.log(totalPassengerPrice);
      const returnAdultPrice = returnSchedule ? returnSchedule.price * adultCount : 0;
      const returnChildPrice = returnSchedule ? returnSchedule.price * 0.75 * childCount : 0;
      const returnInfantPrice = returnSchedule ? returnSchedule.price * 0.5 * infantCount : 0;

      console.log(returnAdultPrice, returnChildPrice, returnInfantPrice);

      const totalReturnPassengerPrice = returnAdultPrice + returnChildPrice + returnInfantPrice;

      console.log(totalReturnPassengerPrice);

      // Membulatkan harga ke integer terdekat
      const roundedTotalPassengerPrice = Math.round(totalPassengerPrice);
      const roundedTotalReturnPassengerPrice = Math.round(totalReturnPassengerPrice);

      const totalTicketPrice = roundedTotalPassengerPrice + roundedTotalReturnPassengerPrice;
      const adminTax = totalTicketPrice * 0.02;
      const ppn = totalTicketPrice * 0.1;
      console.log(totalTicketPrice, adminTax, ppn);

      const roundedAdminTax = Math.round(adminTax);
      const roundedPpn = Math.round(ppn);

      const totalPrice = totalTicketPrice + roundedAdminTax + roundedPpn;
      console.log(totalPrice);

      console.log(roundedTotalPassengerPrice, roundedTotalReturnPassengerPrice, roundedAdminTax, roundedPpn);

      // Menambahkan item pesanan untuk jadwal keberangkatan
      tripayTransaction.addOrderItem({
        name: 'Total Tiket Pergi',
        price: roundedTotalPassengerPrice,
        quantity: 1,
        sku: schedule.id.toString(),
        subtotal: roundedTotalPassengerPrice,
        image_url: "http://image.com",
        product_url: "http://product.com",
      });
      tripayTransaction.addOrderItem({
        name: "pajak admin",
        price: roundedAdminTax,
        quantity: 1,
        sku: schedule.id.toString(),
        subtotal: roundedAdminTax,
        image_url: "http://image.com",
        product_url: "http://product.com",
      });
      tripayTransaction.addOrderItem({
        name: "pajak PPN",
        price: roundedPpn,
        quantity: 1,
        sku: schedule.id.toString(),
        subtotal: roundedPpn,
        image_url: "http://image.com",
        product_url: "http://product.com",
      });

      // Menambahkan item pesanan untuk jadwal kepulangan (jika ada)
      if (returnSchedule) {
        tripayTransaction.addOrderItem({
          name: 'Total Tiket Kembali',
          price: roundedTotalReturnPassengerPrice,
          quantity: 1,
          sku: schedule.id.toString(),
          subtotal: roundedTotalReturnPassengerPrice,
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
        customer_name: `${user.first_name} ${user.last_name}`,
        customer_email: user.email,
        customer_phone: '085233029994',
        expired_time: Math.floor(Date.now() / 1000) + 3600,
        callback_url: `${process.env.DOMAIN}/api/v1/webhook`,
        return_url: `https://infotiket.in/konfirmasi-pembayaran`,
        signature,
      });

      // Simpan rincian harga ke database
      await prisma.payment.create({
        data: {
          booking_id: booking.id,
          payment_date: new Date(),
          amount: totalPrice,
          payment_method,
          status: "PENDING",
          merchant_ref: transaction.merchant_ref,
          admin_tax: roundedAdminTax,
          ppn_tax: roundedPpn,
          total_adult_price: Math.round(adultPrice + returnAdultPrice),
          total_child_price: Math.round(childPrice + returnChildPrice),
          total_infant_price: Math.round(infantPrice + returnInfantPrice),
        },
      });

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna Transaksi",
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
        adult_price: Math.round(adultPrice + returnAdultPrice),
        child_price: Math.round(childPrice + returnChildPrice),
        infant_price: Math.round(infantPrice + returnInfantPrice),
        admin_tax: roundedAdminTax,
        ppn: roundedPpn,
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
      const { first_name, last_name } = req.user;

      const bookings = await prisma.booking.findMany({
        where: {
          user_id: req.user.id,
        },
      });

      if (bookings.length === 0) {
        return res
          .status(404)
          .json({ message: "Tidak ada transaksi yang ditemukan" });
      }

      const payments = await prisma.payment.findMany({
        where: {
          booking_id: {
            in: bookings.map((booking) => booking.id),
          },
        },
      });

      if (payments.length === 0) {
        return res
          .status(404)
          .json({ message: "Tidak ada pembayaran yang ditemukan" });
      }

      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });

      return res.json(payments);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Terjadi kesalahan saat mengambil pembayaran." });
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
          message: `Hai ${req.user.first_name} ${req.user.last_name}, anda telah berhasil mendapatkan pembayaran yang pending!`,
          user_id: req.user.id,
        },
      });
      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${req.user.id}`, notification);

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
