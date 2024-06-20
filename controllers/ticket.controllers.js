const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { sendMail, getHTML } = require('../libs/nodemailer');

module.exports = {
  tripayWebhook: async (req, res) => {
    const { merchant_ref, status } = req.body;

    try {
      if (status === 'PAID') {
        // Update status payment menjadi SUDAH BAYAR
        const payment = await prisma.payment.update({
          where: { merchant_ref },
          data: { status: 'SUDAH BAYAR' }
        });

        // Update status booking menjadi SELESAI
        const booking = await prisma.booking.update({
          where: { id: payment.booking_id },
          data: { status: 'SELESAI' },
          include: { user: true, passengers: true, schedule: true } // Sertakan schedule
        });

        // Generate tiket untuk setiap penumpang dalam booking
        const tickets = await Promise.all(
          booking.passengers.map(async (passenger) => {
            return prisma.ticket.create({
              data: {
                booking_id: booking.id,
                ticket_number: generateTicketNumber(),
                passenger_id: passenger.id,
                schedule_id: booking.schedule_id
              },
              include: {
                booking: true,     // Sertakan booking
                passenger: true,   // Sertakan passenger
                schedule: true     // Sertakan schedule
              }
            });
          })
        );

        // Mengirim email konfirmasi dengan detail tiket
        const emailContent = await getHTML('ticketEmailTemplate.ejs', { tickets });
        await sendMail(booking.user.email, 'Your Tickets', emailContent);

        res.status(200).send('OK');
      } else {
        res.status(400).send('Invalid status');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating transaction status');
    }
  }
};

function generateTicketNumber() {
  // Implementasikan logika untuk menghasilkan nomor tiket yang unik
  return 'TICKET-' + uuidv4();
}
