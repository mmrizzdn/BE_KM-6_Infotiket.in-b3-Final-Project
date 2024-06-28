const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createBookingWithPassengers: async (req, res, next) => {
    const { booking_date, total_passenger, passengers } = req.body;
    const { schedule_id, return_schedule_id } = req.query;

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

      const bookingData = {
        user_id: userId,
        booking_date: new Date(booking_date),
        total_passenger,
        status: "PENDING",
        schedule_id: schedule_id,
      };

      if (return_schedule_id) {
        bookingData.return_schedule_id = return_schedule_id;
      }

      const booking = await prisma.booking.create({
        data: bookingData,
      });

      const passengerPromises = passengers.map((passenger) =>
        prisma.passenger.create({
          data: {
            booking_id: booking.id,
            birth_date: new Date(passenger.birth_date),
            type: passenger.type,
            id_passport_number: passenger.id_passport_number,
            citizenship: passenger.citizenship,
            gender: passenger.gender,
            first_name: passenger.first_name,
            last_name: passenger.last_name,
            phone_number: passenger.phone_number,
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
        message:
          "Terjadi kesalahan saat membuat booking dan menambahkan penumpang",
        data: null,
      });
    }
  },
  getPendingBookingsByUserId: async (req, res, next) => {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User ID tidak ditemukan atau anda belum login",
          data: null,
        });
      }

      const bookings = await prisma.booking.findMany({
        where: {
          user_id: userId,
          status: "PENDING",
        },
        include: {
          passengers: true,
        },
      });

      if (!bookings || bookings.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Tidak ada booking yang ditemukan untuk user ini",
          data: null,
        });
      }

      // Get schedule details for each booking
      const bookingsWithSchedule = await Promise.all(
        bookings.map(async (booking) => {
          const schedule = await prisma.schedule.findUnique({
            where: { id: booking.schedule_id },
          });
          return { ...booking, schedule };
        })
      );

      return res.status(200).json({
        status: true,
        message: "Berhasil mendapatkan booking",
        data: bookingsWithSchedule,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Terjadi kesalahan saat mendapatkan booking",
        data: null,
      });
    }
  },
  getBookingsByUserId: async (req, res, next) => {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User ID tidak ditemukan atau anda belum login",
          data: null,
        });
      }

      const bookings = await prisma.booking.findMany({
        where: { user_id: userId },
        include: {
          passengers: true,
        },
      });

      if (!bookings || bookings.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Tidak ada booking yang ditemukan untuk user ini",
          data: null,
        });
      }

      // Get schedule details for each booking
      const bookingsWithSchedule = await Promise.all(
        bookings.map(async (booking) => {
          const schedule = await prisma.schedule.findUnique({
            where: { id: booking.schedule_id },
          });
          return { ...booking, schedule };
        })
      );

      return res.status(200).json({
        status: true,
        message: "Berhasil mendapatkan booking",
        data: bookingsWithSchedule,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Terjadi kesalahan saat mendapatkan booking",
        data: null,
      });
    }
  },
};
