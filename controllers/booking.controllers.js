const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createBooking: async (req, res, next) => {
    const { user_id, booking_date, total_passenger, status } = req.body;
    const { schedule_id } = req.query;

    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      if (!user_id) {
        return res.status(400).json({
          status: false,
          message: "User ID tidak ditemukan",
          data: null,
        });
      }

      const booking = await prisma.booking.create({
        data: {
          user_id: parseInt(user_id),
          booking_date: new Date(booking_date),
          total_passenger,
          status: 'PENDING',
          schedule_id: parseInt(schedule_id)
        },
      });

      return res.status(201).json({
        status: true,
        message: "Berhasil membuat data Booking",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  getBooking: async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      const bookings = await prisma.booking.findMany({
        where: { user_id: user.id },
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
      next(error);
    }
  },
};
