const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { sendMail, getHTML } = require('../libs/nodemailer');
const { checkPaymentStatus } = require('./transaction.controllers');

module.exports = {
  tripayWebhook: async (req, res) => {
    const { merchant_ref, status } = req.body;

    // if (!verifySignature(req.query)) {
    //   return res.status(400).send('Invalid signature');
    // }

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

        const schedule = await prisma.schedule.findFirst({
          where: { id: booking.schedule_id }
        });

        if (!schedule) {
          return res.status(404).send('Schedule tidak ditemukan');
        }

        // Generate tiket untuk setiap penumpang dalam booking
        const tickets = await Promise.all(
          booking.passengers.map(async (passenger) => {
            return prisma.ticket.create({
              data: {
                booking_id: booking.id,
                ticket_number: generateTicketNumber(),
                passenger_id: passenger.id,
                schedule_id: booking.schedule_id
              }
            });
          })
        );

        const ticketsWithDetails = tickets.map(ticket => ({
          ...ticket,
          booking,
          passenger: booking.passengers.find(p => p.id === ticket.passenger_id),
          schedule
        }));



        // Mengirim email konfirmasi dengan detail tiket
        const emailContent = await getHTML('ticketEmailTemplate.ejs', { tickets: ticketsWithDetails });
        await sendMail(booking.user.email, 'Your Tickets', emailContent);

        console.log(`Tickets sent to ${booking.user.email}`);
        return res.status(200).json({
          Notification : `Tickets sent to ${booking.user.email} with status ${status}`,
          status : 200,
          data : ticketsWithDetails
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
  paymentConfirmation: async (req, res, next) => {
    try {
      const { bookingId } = req.query;
  
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: { user: true, passengers: true }
      });
  
      if (!booking) {
        return res.status(404).json({ error: "Booking tidak ditemukan" });
      }
  
      const payment = await prisma.payment.findFirst({
        where: { booking_id: booking.id }
      });
  
      if (!payment) {
        return res.status(404).json({ error: "Pembayaran tidak ditemukan" });
      }
  
      const schedule = await prisma.schedule.findFirst({
        where: { id: booking.schedule_id }
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
  },
  
  getTicketFromBookingId : async (req, res, next) => {
    try {
      const { bookingId } = req.params;
      const tickets = await prisma.ticket.findMany({
        where: { booking_id: bookingId },
        include: {
          booking: true,     
          passenger: true,   
        }
      });

      const scheduleIds = tickets.map(ticket => ticket.schedule_id);
      const schedules = await prisma.schedule.findMany({
        where: { id: { in: scheduleIds } }
      });

      const ticketsWithDetails = tickets.map(ticket => ({
        ...ticket,
        schedule: schedules.find(schedule => schedule.id === ticket.schedule_id)
      }));

      res.status(200).json(ticketsWithDetails);
    } catch (error) {
      next(error);
    }
  }
};

function generateTicketNumber() {
  return 'TICKET-' + uuidv4();
}

// function verifySignature(query) {
//   // Implementasikan logika verifikasi signature
//   const { merchant_ref, status, signature } = query;
//   const secretKey = 'LvgVc-yIoY5-zaRmD-c5qHr-E2Ayr';
//   const hash = require('crypto').createHmac('sha256', secretKey)
//     .update(`${merchant_ref}${status}`)
//     .digest('hex');

//   return hash === signature;
// }
