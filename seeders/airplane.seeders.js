const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function airplane() {
	const filePath = path.join(__dirname, 'data', 'airplanes.json');
	const airplanesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

	for (const airplane of airplanesData) {
		await prisma.airplane.create({
			data: {
				model: airplane.model,
				seat_layout: airplane.seat_layout,
				seat_pitch: airplane.seat_pitch,
				seat_type: airplane.seat_type,
				seat_amount: airplane.seat_amount,
				airline_id: airplane.airline_id
			}
		});
	}

	console.info('Data inserted');
}

module.exports = { airplane };
