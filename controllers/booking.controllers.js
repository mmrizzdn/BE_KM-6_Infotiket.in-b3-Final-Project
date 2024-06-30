const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createBooking: async (req, res, next) => {
    const { booking_date, total_passenger, first_name, last_name } = req.body;
    const { schedule_id } = req.query;

    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User ID tidak ditemukan atau anda belum login",
          data: null,
        });
      }

      // Validasi schedule_id
      if (!schedule_id) {
        return res.status(400).json({
          status: false,
          message: "Schedule ID tidak ditemukan",
          data: null,
        });
      }

      // Validasi booking_date
      if (!booking_date) {
        return res.status(400).json({
          status: false,
          message: "Tanggal booking tidak ditemukan",
          data: null,
        });
      }

      // Validasi total_passenger
      if (!total_passenger || total_passenger <= 0) {
        return res.status(400).json({
          status: false,
          message: "Jumlah penumpang tidak valid",
          data: null,
        });
      }

      const booking = await prisma.booking.create({
        data: {
          user_id: userId,
          booking_date: new Date(booking_date),
          total_passenger,
          status: "PENDING",
          schedule_id: parseInt(schedule_id),
        },
      });

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna membuat data Booking",
          message: `Hai ${user.first_name} ${user.last_name}, anda telah membuat data booking!`,
          user_id: user.id,
        },
      });
      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notification);

      return res.status(201).json({
        status: true,
        message: "Berhasil membuat data Booking",
        data: booking,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Terjadi kesalahan saat membuat data Booking",
        data: null,
      });
    }
  },

  getBooking: async (req, res, next) => {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      const bookings = await prisma.booking.findMany({
        where: { user_id: userId },
        include: {
          user: true,
          schedule: true,
          passengers: true,
          payments: true,
        },
      });

      return res.status(200).json({
        status: true,
        message: "Berhasil mengambil data Booking",
        data: bookings,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Terjadi kesalahan saat mengambil data Booking",
        data: null,
      });
    }
  },
};
