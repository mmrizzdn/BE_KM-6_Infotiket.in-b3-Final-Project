const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { airline } = require('./airline.seeders');
const { airport } = require('./airport.seeders');
const { flight } = require('./flight.seeders');

async function main() {
	await airline();
	await airport();
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
