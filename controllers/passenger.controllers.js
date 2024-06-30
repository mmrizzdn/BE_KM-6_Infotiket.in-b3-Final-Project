const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  addPassenger: async (req, res, next) => {
    const {
      full_name,
      birth_date,
      type,
      id_passport_number,
      citizenship,
      first_name,
      last_name,
    } = req.body;
    const { booking_id } = req.query;

    try {
      if (
        !full_name ||
        !birth_date ||
        !type ||
        !id_passport_number ||
        !citizenship
      ) {
        return res.status(400).json({
          status: false,
          message: "Semua kolom harus diisi!",
          data: null,
        });
      }

      const passenger = await prisma.passenger.create({
        data: {
          booking_id: parseInt(booking_id),
          full_name,
          birth_date: new Date(birth_date),
          type,
          id_passport_number,
          citizenship,
        },
      });

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna menambahkan data penumpang",
          message: `Hai ${user.first_name} ${user.last_name}, anda telah menambahkan data penumpang!`,
          user_id: user.id,
        },
      });
      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notification);

      return res.status(201).json({
        status: true,
        message: "Berhasil menambahkan data penumpang",
        data: passenger,
      });
    } catch (error) {
      next(error);
    }
  },
};
