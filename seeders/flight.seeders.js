const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

async function main() {
  const filePath = path.join(__dirname, "data", "schedules.json");
  const flightsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  for (const flightKey in flightsData) {
    const flight = flightsData[flightKey];

    const departureAirport = await prisma.airport.findFirst({
      where: { iata_code: flight.departureAirport },
    });
    const arrivalAirport = await prisma.airport.findFirst({
      where: { iata_code: flight.arrivalAirport },
    });
    const airline = await prisma.airline.findFirst({
      where: { iata_code: flight.airlineCode },
    });

    if (departureAirport && arrivalAirport && airline) {
      await prisma.flight.create({
        data: {
          departure_airport_id: departureAirport.id,
          arrival_airport_id: arrivalAirport.id,
          airline_id: airline.id,
          departure_time: flight.departureTime,
          arrival_time: flight.arrivalTime,
          price: flight.price,
          flight_number: flight.flightNumber,
          free_baggage: flight.freeBaggage,
          cabin_baggage: flight.cabinBaggage,
          duration_minute: flight.durationMinute,
          class: flight.class,
          is_sunday: flight.isSunday,
          is_monday: flight.isMonday,
          is_tuesday: flight.isTuesday,
          is_wednesday: flight.isWednesday,
          is_thursday: flight.isThursday,
          is_friday: flight.isFriday,
          is_saturday: flight.isSaturday,
        },
      });
    }
  }

  console.info("Data penerbangan berhasil dimasukkan");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });