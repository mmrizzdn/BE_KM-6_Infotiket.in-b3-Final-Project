const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createBookingWithPassengers: async (req, res, next) => {
    const { booking_date, total_passenger, passengers } = req.body;
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

      if (!schedule_id) {
        return res.status(400).json({
          status: false,
          message: "Schedule ID tidak ditemukan",
          data: null,
        });
      }

      if (!booking_date) {
        return res.status(400).json({
          status: false,
          message: "Tanggal booking tidak ditemukan",
          data: null,
        });
      }

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
          status: 'PENDING',
          schedule_id: schedule_id
        },
      });

      const passengerPromises = passengers.map((passenger) =>
        prisma.passenger.create({
          data: {
            booking_id: booking.id,
            full_name: passenger.full_name,
            birth_date: new Date(passenger.birth_date),
            type: passenger.type,
            id_passport_number: passenger.id_passport_number,
            citizenship: passenger.citizenship,
          },
        })
      );

      await Promise.all(passengerPromises);

      return res.status(201).json({
        status: true,
        message: "Berhasil membuat booking dan menambahkan penumpang",
        data: booking,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Terjadi kesalahan saat membuat booking dan menambahkan penumpang",
        data: null,
      });
    }
  },
};
