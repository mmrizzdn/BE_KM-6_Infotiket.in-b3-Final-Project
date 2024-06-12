const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  airports: async (req, res, next) => {
    try {
      let airports = await prisma.airport.findMany({
        include: {
          from_flights: true,
          to_flights: true,
        },
      });

      if (!airports) {
        return res.status(404).json({
          status: false,
          messsage: "Data Airports tidak ditemukan!",
          data: null,
        });
      }
      res.status(200).json({
        status: true,
        message: "Berhasil menampilkan semua data Bandara",
        data: airports,
      });
    } catch (error) {
      next(error);
    }
  },

  airport: async (req, res, next) => {
    try {
      let id = Number(req.params.id);
      let airport = await prisma.airport.findUnique({
        where: { id },
        include: {
          from_flights: true,
          to_flights: true,
        },
      });

      if (!airport) {
        return res.status(404).json({
          status: false,
          messsage: "Data Airport tidak ditemukan!",
          data: null,
        });
      }
      res.status(200).json({
        status: true,
        message: "Berhasil menampilkan data Bandara",
        data: airport,
      });
    } catch (error) {
      next(error);
    }
  },
};
