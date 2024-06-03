const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFlights = async (req, res) => {
  const { departureAirport, arrivalAirport, departureDate, returnDate } = req.query;

  try {
    const departureFlights = await prisma.flightSchedule.findMany({
      where: {
        departureAirport,
        arrivalAirport,
        departureDate: new Date(departureDate)
      }
    });

    let returnFlights = [];
    if (returnDate) {
      returnFlights = await prisma.flightSchedule.findMany({
        where: {
          departureAirport: arrivalAirport,
          arrivalAirport: departureAirport,
          departureDate: new Date(returnDate)
        }
      });
    }

    res.json({
      departureFlights,
      returnFlights
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getFlights
};
