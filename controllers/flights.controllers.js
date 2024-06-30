const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getPagination(req, page, limit, count) {
  let link = {};
  let path = `${req.protocol}://${req.get('host')}` + req.baseUrl + req.path;

  if (count - page * limit <= 0) {
    link.next = '';
    if (page - 1 <= 0) {
      link.prev = '';
    } else {
      link.prev = `${path}?page=${page - 1}&limit=${limit}`;
    }
  } else {
    link.next = `${path}?page=${page + 1}&limit=${limit}`;
    if (page - 1 <= 0) {
      link.prev = '';
    } else {
      link.prev = `${path}?page=${page - 1}&limit=${limit}`;
    }
  }

  return {
    link,
    total: count
  };
}

const getFlights = async (req, res) => {
  const {
    departureAirport,
    arrivalAirport,
    departureDate,
    returnDate,
    flightClass,
    page = 1,
    limit = 10,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  try {
    const departureAirportRecord = await prisma.airport.findFirst({
      where: {
        iata_code: departureAirport,
      },
    });

    const arrivalAirportRecord = await prisma.airport.findFirst({
      where: {
        iata_code: arrivalAirport,
      },
    });

    if (!departureAirportRecord || !arrivalAirportRecord) {
      return res.status(404).json({ error: "Bandara Tidak Ditemukan" });
    }

    const departureAirportId = departureAirportRecord.id;
    const arrivalAirportId = arrivalAirportRecord.id;

    const classFilter = flightClass ? { class: flightClass.toUpperCase() } : {};

    const departureFlights = await prisma.schedule.findMany({
      where: {
        departure_airport_id: departureAirportId,
        arrival_airport_id: arrivalAirportId,
        Date: new Date(departureDate),
        ...classFilter,
      },
      include: {
        departure_airport: true,
        arrival_airport: true,
        airline: true,
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    const departureFlightCount = await prisma.schedule.count({
      where: {
        departure_airport_id: departureAirportId,
        arrival_airport_id: arrivalAirportId,
        Date: new Date(departureDate),
        ...classFilter,
      },
    });

    let returnFlights = [];
    let returnFlightCount = 0;

    if (returnDate) {
      returnFlights = await prisma.schedule.findMany({
        where: {
          departure_airport_id: arrivalAirportId,
          arrival_airport_id: departureAirportId,
          Date: new Date(returnDate),
          ...classFilter,
        },
        include: {
          departure_airport: true,
          arrival_airport: true,
          airline: true,
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      });

      returnFlightCount = await prisma.schedule.count({
        where: {
          departure_airport_id: arrivalAirportId,
          arrival_airport_id: departureAirportId,
          Date: new Date(returnDate),
          ...classFilter,
        },
      });
    }

    if (departureFlights.length === 0 && returnFlights.length === 0) {
      return res.status(404).json({ error: "Jadwal Tidak Ditemukan" });
    }

    const departurePagination = getPagination(req, pageNum, limitNum, departureFlightCount);
    const returnPagination = getPagination(req, pageNum, limitNum, returnFlightCount);

    res.json({
      departureFlights,
      departurePagination,
      returnFlights,
      returnPagination,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
};

module.exports = {
  getFlights,
};
