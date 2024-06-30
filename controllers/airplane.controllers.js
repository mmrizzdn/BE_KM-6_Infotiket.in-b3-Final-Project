const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
	createAirplane: async (req, res, next) => {
		try {
			let {
				model,
				seat_layout,
				seat_pitch,
				seat_type,
				seat_amount,
				airline_id
			} = req.body;

			if (!model || !seat_amount || !airline_id) {
				return res.status(400).json({
					status: false,
					message: 'model, seat_amount, dan airline_id required!',
					data: null
				});
			}

			let airplane = await prisma.airplane.create({
				data: {
					model,
					seat_layout,
					seat_pitch,
					seat_type,
					seat_amount,
					airline_id
				}
			});

			res.status(201).json({
				status: true,
				message: 'airplane created successfully!',
				data: airplane
			});
		} catch (error) {
			next(error);
		}
	},

	getAllAirplanes: async (req, res, next) => {
		try {
			let airplanes = await prisma.airplane.findMany();

			if (!airplanes) {
				return res.status(404).json({
					status: false,
					messsage: 'airplane not found!',
					data: null
				});
			}
			res.status(200).json({
				status: true,
				message: 'get all airplanes success!',
				data: airplanes
			});
		} catch (error) {
			next(error);
		}
	},

	getAirplaneById: async (req, res, next) => {
		try {
			let id = Number(req.params.id);
			let airplane = await prisma.airplane.findUnique({
				where: { id }
			});

			if (!airplane) {
				return res.status(404).json({
					status: false,
					messsage: 'airplane not found!',
					data: null
				});
			}
			res.status(200).json({
				status: true,
				message: 'get an airplane success!',
				data: airplane
			});
		} catch (error) {
			next(error);
		}
	},

	updateAirplane: async (req, res, next) => {
		try {
			let id = Number(req.params.id);

			let { model, seat_layout, seat_pitch, seat_type, seat_amount } =
				req.body;

			let airplane = await prisma.airplane.findUnique({
				where: { id }
			});

			if (!airplane) {
				return res.status(400).json({
					status: false,
					message: 'airplane not found!',
					data: null
				});
			}

			let updatedAirplane = await prisma.airplane.update({
				where: { id },
				data: {
					model,
					seat_layout,
					seat_pitch,
					seat_type,
					seat_amount
				}
			});

			res.status(200).json({
				status: true,
				message: 'airplane updated successfully!',
				data: updatedAirplane
			});
		} catch (error) {
			next(error);
		}
	},

	deleteAirplane: async (req, res, next) => {
		try {
			let id = Number(req.params.id);

			let airplane = await prisma.airplane.findUnique({
				where: { id }
			});

			if (!airplane) {
				return res.status(400).json({
					status: false,
					message: 'airplane not found!',
					data: null
				});
			}

			let deletedAirplane = await prisma.airplane.delete({
				where: { id }
			});

			res.status(200).json({
				status: true,
				message: 'airplane deleted successfully!',
				data: deletedAirplane
			});
		} catch (error) {
			next(error);
		}
	}
};
