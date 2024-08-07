const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateFlightSchedules = async () => {
  console.log("Hasilkan Jadwal Penerbangan...");
  try {
    const today = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const flightTemplates = await prisma.flight.findMany();

    await prisma.schedule.deleteMany();

    const flightSchedules = [];

    // Generate jadwal penerbangan untuk 7 hari ke depan
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = daysOfWeek[date.getDay()];

      flightTemplates.forEach((template) => {
        if (template[`is_${dayOfWeek.toLowerCase()}`]) {
          const uniqueId = `${template.flight_number}_${template.is_sunday}_${template.is_monday}_${template.is_tuesday}_${template.is_wednesday}_${template.is_thursday}_${template.is_friday}_${template.is_saturday}`;
          const scheduleData = {
            id: uniqueId,
            departure_airport_id: template.departure_airport_id,
            arrival_airport_id: template.arrival_airport_id,
            airline_id: template.airline_id,
            departure_time: template.departure_time,
            arrival_time: template.arrival_time,
            price: template.price,
            flight_number: template.flight_number,
            free_baggage: template.free_baggage,
            cabin_baggage: template.cabin_baggage,
            duration_minute: template.duration_minute,
            class: template.class,
            Date: new Date(date),
            seat_available: 25,
            is_available: true,
          };

          // Pastikan id unik sebelum dimasukkan
          if (!flightSchedules.some(schedule => schedule.id === uniqueId)) {
            flightSchedules.push(scheduleData);
          }
        }
      });
    }
    await prisma.schedule.createMany({
      data: flightSchedules,
    });

    console.log("Jadwal berhasil dibuat");
  } catch (error) {
    console.error("Error :", error);
  }
};

generateFlightSchedules();

// Atur tugas cron untuk menjalankan setiap hari pukul 00:00
let task = cron.schedule("0 0 * * *", generateFlightSchedules, {
  timezone: "Asia/Jakarta",
});
task.start();
