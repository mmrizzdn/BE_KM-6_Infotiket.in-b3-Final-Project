const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFlights = async (req, res) => {
	const {
		departureAirport,
		arrivalAirport,
		departureDate,
		returnDate,
		flightClass
	} = req.query;

	try {
		const departureAirportRecord = await prisma.airport.findFirst({
			where: {
				iata_code: departureAirport
			}
		});

		const arrivalAirportRecord = await prisma.airport.findFirst({
			where: {
				iata_code: arrivalAirport
			}
		});

		if (!departureAirportRecord || !arrivalAirportRecord) {
			return res.status(404).json({ error: 'Airport not found' });
		}

		const departureAirportId = departureAirportRecord.id;
		const arrivalAirportId = arrivalAirportRecord.id;

		// Filter based on flight class
		const classFilter = flightClass
			? { class: flightClass.toUpperCase() }
			: {};

		// Cari jadwal penerbangan berdasarkan ID bandara dan tanggal keberangkatan
		const departureFlights = await prisma.schedule.findMany({
			where: {
				departure_airport_id: departureAirportId,
				arrival_airport_id: arrivalAirportId,
				Date: new Date(departureDate),
				...classFilter
			},
			include: {
				departure_airport: true,
				arrival_airport: true,
				airline: true
			}
		});

		let returnFlights = [];
		if (returnDate) {
			returnFlights = await prisma.schedule.findMany({
				where: {
					departure_airport_id: arrivalAirportId,
					arrival_airport_id: departureAirportId,
					Date: new Date(returnDate),
					...classFilter
				},
				include: {
					departure_airport: true,
					arrival_airport: true,
					airline: true
				}
			});
		}

		if (departureFlights.length === 0 && returnFlights.length === 0) {
			return res.status(404).json({ error: 'Flight not found' });
		}

		res.json({
			departureFlights,
			returnFlights
		});
	} catch (error) {
		res.status(500).json({ error: 'Internal server error: ' + error });
	}
};

module.exports = {
	getFlights
};
