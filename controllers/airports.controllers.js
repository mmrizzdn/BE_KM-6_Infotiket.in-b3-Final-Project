const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createAirport: async (req, res, next) => {
    try {
      const { name_airport, city, province, time_zone, iata_code } = req.body;

      // Membuat data bandara baru
      const airport = await prisma.airport.create({
        data: {
          name_airport,
          city,
          province,
          time_zone,
          iata_code,
        },
      });

      // respon json ketika data bandara berhasil di buat
      res.status(201).json({
        status: true,
        message: "Berhasil membuat data bandara",
        data: airport,
      });
    } catch (error) {
      next(error);
    }
  },

  getAllAirports: async (req, res, next) => {
    try {
      // mencari data aiport dengan from_flights dan to to_flights
      let airports = await prisma.airport.findMany({
        include: {
          from_flights: true,
          to_flights: true,
        },
      });

      // Periska data aiport jika tidak ada
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

  getAirportById: async (req, res, next) => {
    try {
      let id = Number(req.params.id);

      // mencari data aiport berdasarkan id dengan from_flights dan to to_flights
      let airport = await prisma.airport.findUnique({
        where: { id },
        include: {
          from_flights: true,
          to_flights: true,
        },
      });

      // Periska data aiport jika tidak ada
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

  updateAirportById: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { name_airport, city, province, time_zone, iata_code } = req.body;

      // mencari data airport berdasarkan id
      let airport = await prisma.airport.findUnique({
        where: { id },
      });

      // Periksa data airport jika tidak ada
      if (!airport) {
        return res.status(404).json({
          status: false,
          message: "Data Airport tidak ditemukan!",
          data: null,
        });
      }

      airport = await prisma.airport.update({
        where: { id },
        data: {
          name_airport,
          city,
          province,
          time_zone,
          iata_code,
        },
      });

      return res.status(200).json({
        status: true,
        message: "Berhasil memperbarui data bandara",
        data: airport,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteAirportByid: async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      // Periksa apakah bandara ada
      const airport = await prisma.airport.findUnique({
        where: { id },
        include: {
          from_flights: true,
          to_flights: true,
          schedule_from_flights: true,
          schedule_to_flights: true,
        },
      });

      // periksa data aiport jika tidak ada
      if (!airport) {
        return res.status(404).json({
          status: false,
          message: "Data Airport tidak ditemukan!",
          data: null,
        });
      }

      // Hapus semua penerbangan yang terkait
      await prisma.flight.deleteMany({
        where: {
          OR: [{ departure_airport_id: id }, { arrival_airport_id: id }],
        },
      });

      // Hapus semua jadwal yang terkait
      await prisma.schedule.deleteMany({
        where: {
          OR: [{ departure_airport_id: id }, { arrival_airport_id: id }],
        },
      });

      // Hapus bandara
      await prisma.airport.delete({
        where: { id },
      });

      return res.status(200).json({
        status: true,
        message: "Berhasil menghapus data bandara",
        data: airport,
      });
    } catch (error) {
      next(error);
    }
  },
};
