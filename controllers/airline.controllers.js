const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  airlines: async (req, res, next) => {
    try {
      let airlines = await prisma.airline.findMany();

      if (!airlines) {
        return res.status(404).json({
          status: false,
          messsage: "Data airlines tidak ditemukan!",
          data: null,
        });
      }
      res.status(200).json({
        status: true,
        message: "Berhasil menampilkan semua data airlines",
        data: airlines,
      });
    } catch (error) {
      next(error);
    }
  },

  airline: async (req, res, next) => {
    try {
      let id = Number(req.params.id);
      let airline = await prisma.airline.findUnique({
        where: { id },
      });

      if (!airline) {
        return res.status(404).json({
          status: false,
          messsage: "Data airline tidak ditemukan!",
          data: null,
        });
      }
      res.status(200).json({
        status: true,
        message: "Berhasil menampilkan data airline",
        data: airline,
      });
    } catch (error) {
      next(error);
    }
  },
};
