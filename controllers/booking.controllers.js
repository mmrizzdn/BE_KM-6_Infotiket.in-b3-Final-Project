const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createBooking: async (req, res, next) => {
    const { user_id, ticket_id, booking_date, total_passenger, status } =
      req.body;
    try {
      let user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }
      const userId = await prisma.user.findUnique({
        where: { id: parseInt(user_id) },
      });
      const ticketId = await prisma.ticket.findUnique({
        where: { id: parseInt(ticket_id) },
      });

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      if (!ticketId) {
        return res.status(400).json({
          status: false,
          message: "Ticket tidak ditemukan",
          data: null,
        });
      }
      const booking = await prisma.booking.create({
        data: {
          user_id: parseInt(user_id),
          ticket_id: parseInt(ticket_id),
          booking_date: new Date(booking_date),
          total_passenger,
          status,
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
      let user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }
      const bookings = await prisma.booking.findMany({
        include: {
          user: true,
          ticket: true,
        },
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
