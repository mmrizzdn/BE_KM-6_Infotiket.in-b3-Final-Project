const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
	addPassenger: async (req, res) => {
		try {
			let {
				full_name,
				birth_date,
				type,
				id_passport_number,
				citizenship
			} = req.body;

			if (
				!full_name ||
				!birth_date ||
				!type ||
				!id_passport_number ||
				!citizenship
			) {
				return res.status(400).json({
					status: false,
					message: 'Semua kolom harus diisi!',
					data: null
				});
			}

			await prisma.passenger.create({
				data: {
					full_name,
					birth_date,
					type,
					id_passport_number,
					citizenship
				}
			});

			return res.status(200).json({
				status: true,
				message: 'Berhasil menambahkan data penumpang',
				data: null
			});
		} catch (error) {
			next(error);
		}
	}
};
