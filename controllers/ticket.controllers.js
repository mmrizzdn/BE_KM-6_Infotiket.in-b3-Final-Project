const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { sendMail, getHTML } = require('../libs/nodemailer');

module.exports = {
  tripayWebhook: async (req, res) => {
    const { merchant_ref, status } = req.body;

    try {
      if (status === 'PAID') {
        const paymentRecord = await prisma.payment.findFirst({
          where: { merchant_ref }
        });

        if (!paymentRecord) {
          return res.status(404).send('Payment not found');
        }

        const payment = await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: { status: 'SUDAH BAYAR' }
        });

        const booking = await prisma.booking.update({
          where: { id: payment.booking_id },
          data: { status: 'SELESAI' },
          include: { user: true, passengers: true }
        });

        let tickets = [];
        if (booking.schedule_id) {
          const schedule = await prisma.schedule.findFirst({
            where: { id: booking.schedule_id },
            include: {
              departure_airport: true,
              arrival_airport: true,
              airline: true,
            }
          });

          if (!schedule) {
            return res.status(404).send('Schedule tidak ditemukan');
          }

          const departureTickets = await Promise.all(
            booking.passengers.map(async (passenger) => {
              return prisma.ticket.create({
                data: {
                  booking_id: booking.id,
                  ticket_number: generateTicketNumber(),
                  passenger_id: passenger.id,
                  schedule_id: booking.schedule_id,
                  return_schedule_id: null // Tiket berangkat
                },
                include: { passenger: true }
              });
            })
          );

          tickets = tickets.concat(departureTickets);
        }

        if (booking.return_schedule_id) {
          const returnSchedule = await prisma.schedule.findFirst({
            where: { id: booking.return_schedule_id },
            include: {
              departure_airport: true,
              arrival_airport: true,
              airline: true,
            }
          });

          if (!returnSchedule) {
            return res.status(404).send('Return schedule tidak ditemukan');
          }

          const returnTickets = await Promise.all(
            booking.passengers.map(async (passenger) => {
              return prisma.ticket.create({
                data: {
                  booking_id: booking.id,
                  ticket_number: generateTicketNumber(),
                  passenger_id: passenger.id,
                  schedule_id: booking.return_schedule_id,
                  return_schedule_id: booking.return_schedule_id // Tiket pulang
                },
                include: { passenger: true }
              });
            })
          );

          tickets = tickets.concat(returnTickets);
        }

        const scheduleIds = tickets.map(ticket => ticket.schedule_id);
        const schedules = await prisma.schedule.findMany({
          where: { id: { in: scheduleIds } },
          include: {
            departure_airport: true,
            arrival_airport: true,
            airline: true
          }
        });

        const ticketsWithDetails = tickets.map(ticket => ({
          ...ticket,
          schedule: schedules.find(schedule => schedule.id === ticket.schedule_id)
        }));

        const emailContent = await getHTML('ticketEmailTemplate.ejs', { tickets: ticketsWithDetails });
        await sendMail(booking.user.email, 'Your Tickets', emailContent);

        console.log(`Tickets sent to ${booking.user.email}`);
        return res.status(200).json({
          Notification: `Tickets sent to ${booking.user.email} with status ${status}`,
          status: 200,
          data: ticketsWithDetails
        });

      } else {
        console.log(`Invalid status received: ${status}`);
        res.status(400).send('Invalid status');
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).send('Error updating transaction status');
    }
  },

  getTicketFromBookingId: async (req, res, next) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          user_id: userId
        }
      });

      if (!booking) {
        return res.status(404).json({ error: "Booking not found or not authorized" });
      }

      const tickets = await prisma.ticket.findMany({
        where: { booking_id: bookingId },
        include: {
          booking: true,
          passenger: true,
        }
      });

      const scheduleIds = tickets.map(ticket => ticket.schedule_id);
      const schedules = await prisma.schedule.findMany({
        where: { id: { in: scheduleIds } },
        include: {
          departure_airport: true,
          arrival_airport: true,
          airline: true
        }
      });

      const ticketsWithDetails = tickets.map(ticket => ({
        ...ticket,
        schedule: schedules.find(schedule => schedule.id === ticket.schedule_id)
      }));

      res.status(200).json(ticketsWithDetails);
    } catch (error) {
      next(error);
    }
  },
    getAllTicketsByUserId: async (req, res, next) => {
    try {
      const userId = req.user.id; // assuming the user ID is available from the token

      const bookings = await prisma.booking.findMany({
        where: {
          user_id: userId
        }
      });

      const bookingIds = bookings.map(booking => booking.id);

      const tickets = await prisma.ticket.findMany({
        where: { booking_id: { in: bookingIds } },
        include: {
          booking: true,
          passenger: true,
        }
      });

      const scheduleIds = tickets.map(ticket => ticket.schedule_id);
      const schedules = await prisma.schedule.findMany({
        where: { id: { in: scheduleIds } },
        include: {
          departure_airport: true,
          arrival_airport: true,
          airline: true
        }
      });

      const ticketsWithDetails = tickets.map(ticket => ({
        ...ticket,
        schedule: schedules.find(schedule => schedule.id === ticket.schedule_id)
      }));

      res.status(200).json(ticketsWithDetails);
    } catch (error) {
      next(error);
    }
  },
  paymentConfirmation: async (req, res, next) => {
    try {
      const { tripay_merchant_ref } = req.query;

      const payment = await prisma.payment.findFirst({
        where: { merchant_ref: tripay_merchant_ref },
        include: { booking: { include: { user: true, passengers: true } } }
      });

      if (!payment) {
        return res.status(404).json({ error: "Pembayaran tidak ditemukan" });
      }

      const booking = payment.booking;

      if (!booking) {
        return res.status(404).json({ error: "Booking tidak ditemukan" });
      }

      const schedule = await prisma.schedule.findFirst({
        where: { id: booking.schedule_id },
        include: {
          departure_airport: true,
          arrival_airport: true,
          airline: true
        }
      });

      if (!schedule) {
        return res.status(404).json({ error: "Schedule tidak ditemukan" });
      }

      booking.schedule = schedule;

      if (payment.status === 'SUDAH BAYAR') {
        res.status(200).send('Selamat, pembayaran Anda berhasil. Silahkan cek email Anda untuk mencetak tiket Anda.');
      } else {
        res.status(400).send('Pembayaran Anda belum dikonfirmasi. Silahkan coba lagi nanti.');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).send('Error confirming payment');
    }
  }
};

function generateTicketNumber() {
  return 'TICKET-' + uuidv4();
}
