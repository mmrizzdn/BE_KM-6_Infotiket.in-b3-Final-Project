const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { airline } = require('./airline.seeders');
const { airport } = require('./airport.seeders');
const { flight } = require('./flight.seeders');
const { airplane } = require('./airplane.seeders');

async function main() {
	await airline();
	await airport();
	await airplane();
	// await flight();
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
