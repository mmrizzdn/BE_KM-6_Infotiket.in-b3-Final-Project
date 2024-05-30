const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
	const filePath = path.join(__dirname, 'data', 'airlines.json');
	const airlinesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

	for (const airline of airlinesData) {
		await prisma.airline.create({
			data: {
				name: airline.name,
				short_name: airline.short_name,
				icon_url: airline.icon_url,
				iata_code: airline.iata_code
			}
		});
	}

	console.info('Data inserted');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
