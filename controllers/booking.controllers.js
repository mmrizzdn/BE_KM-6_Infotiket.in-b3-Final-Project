const { DateTime } = require("luxon");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createBooking: async (req, res, next) => {
    try {
      let { total_passenger, status } = req.body;

      const bookingDate = DateTime.now();

      const booking = await prisma.booking.create({
        data: {
          user_id: { connect: { id: user_id } },
          ticket_id: { connect: { id: ticket_id } },
          booking_date: bookingDate,
          total_passenger: total_passenger,
          status: status,
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
      const bookings = await prisma.booking.findMany({
        include: { user: true, ticket: true, payments: true },
      });

      return res.status(201).json({
        status: true,
        message: "Berhasil membuat data Booking",
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },
};
