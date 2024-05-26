const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

async function main() {
  const filePath = path.join(__dirname, "data", "airports.json");
  const airportsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  for (const airport of airportsData) {
    await prisma.airport.create({
      data: {
        name_airport: airport.name_airport,
        city: airport.city,
        province: airport.province,
        time_zone: airport.time_zone,
        iata_code: airport.iata_code,
        from_flights: flights.from_flights,
        to_flights: flights.to_flights,
      },
    });
  }

  console.info("Data inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
