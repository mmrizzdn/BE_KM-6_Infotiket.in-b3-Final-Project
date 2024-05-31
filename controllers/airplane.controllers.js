const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
	airplanes: async (req, res, next) => {
		try {
			let airplanes = await prisma.airplane.findMany();

			if (!airplanes) {
				return res.status(404).json({
					status: false,
					messsage: 'Data airplanes tidak ditemukan!',
					data: null
				});
			}
			res.status(200).json({
				status: true,
				message: 'Berhasil menampilkan semua data airplanes',
				data: airplanes
			});
		} catch (error) {
			next(error);
		}
	},

	airplane: async (req, res, next) => {
		try {
			let id = Number(req.params.id);
			let airplane = await prisma.airplane.findUnique({
				where: { id }
			});

			if (!airplane) {
				return res.status(404).json({
					status: false,
					messsage: 'Data airplane tidak ditemukan!',
					data: null
				});
			}
			res.status(200).json({
				status: true,
				message: 'Berhasil menampilkan data airplane',
				data: airplane
			});
		} catch (error) {
			next(error);
		}
	}
};
