const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment-timezone");

module.exports = {
  addPassenger: async (req, res, next) => {
    try {
      let { full_name, birth_date, type, id_passport_number, citizenship } =
        req.body;

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

      passenger = await prisma.passenger.create({
        data: {
          full_name,
          birth_date,
          type,
          id_passport_number,
          citizenship,
        },
      });

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
