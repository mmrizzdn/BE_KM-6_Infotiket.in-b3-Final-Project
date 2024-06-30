const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
	// User management
	addAdmin: async (req, res, next) => {
		try {
			let id = Number(req.params.id);
			let user = await prisma.user.findUnique({ where: { id } });

			if (!user) {
				return res.status(404).json({
					status: false,
					message: 'user not found',
					data: null
				});
			}

			if (user.is_verified === false) {
				return res.status(400).json({
					status: false,
					message: 'user not verified',
					data: null
				});
			}

			let admin = await prisma.user.update({
				where: { id },
				data: { role: 'admin' }
			});

			return res.status(200).json({
				status: true,
				message: `now, ${user.first_name} is an admin`,
				data: admin
			});
		} catch (error) {
			next(error);
		}
	},

	getAllUsers: async (req, res, next) => {
		try {
			let users = await prisma.user.findMany();

			return res.status(200).json({
				status: true,
				message: 'get all users success',
				data: users
			});
		} catch (error) {
			next(error);
		}
	},

	getUserbyId: async (req, res, next) => {
		try {
			let id = Number(req.params.id);

			let user = await prisma.user.findUnique({ where: { id } });

			if (!user) {
				return res.status(404).json({
					status: false,
					message: 'user not found',
					data: null
				});
			}

			return res.status(200).json({
				status: true,
				message: `get user success`,
				data: user
			});
		} catch (error) {
			next(error);
		}
	},

	deleteUser: async (req, res, next) => {
		try {
			let id = Number(req.params.id);
			let user = await prisma.user.findUnique({ where: { id: id } });

			if (!user) {
				return res.status(404).json({
					status: false,
					message: 'user not found',
					data: null
				});
			}

			let bookings = await prisma.booking.findMany({
				where: { user_id: id }
			});

			if (bookings.length > 0) {
				for (let booking of bookings) {
					await prisma.payment.deleteMany({
						where: {
							booking_id: booking.id
						}
					});

					await prisma.ticket.deleteMany({
						where: { booking_id: booking.id }
					});

					await prisma.passenger.deleteMany({
						where: { booking_id: booking.id }
					});
				}
			}

			await prisma.booking.deleteMany({
				where: { user_id: id }
			});

			await prisma.notification.deleteMany({
				where: { user_id: id }
			});

			let deleteUser = await prisma.user.delete({ where: { id } });
			return res.status(200).json({
				status: true,
				message: 'user deleted successfully',
				data: deleteUser
			});
		} catch (error) {
			next(error);
		}
	}
};
