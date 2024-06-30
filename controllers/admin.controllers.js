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
					message: 'User not found',
					data: null
				});
			}

			if (user.is_verified === false) {
				return res.status(400).json({
					status: false,
					message: 'User not verified',
					data: null
				});
			}

			let admin = await prisma.user.update({
				where: { id },
				data: { role: 'admin' }
			});

			return res.status(200).json({
				status: true,
				message: 'Now, you are an admin',
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
				message: 'Success',
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
					message: 'User not found',
					data: null
				});
			}

			return res.status(200).json({
				status: true,
				message: 'success',
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
					message: 'User not found',
					data: null
				});
			}

			let booking = await prisma.booking.findUnique({
				where: { user_id: id }
			});

			await prisma.payment.delete({
				where: {
					booking_id: booking.id
				}
			});

			await prisma.ticket.delete({
				where: { booking_id: booking.id }
			});

			await prisma.passenger.delete({
				where: { booking_id: booking.id }
			});

			await prisma.booking.delete({
				where: { user_id: id }
			});

			await prisma.notification.delete({
				where: { user_id: id }
			});

			let deleteUser = await prisma.user.delete({ where: { id } });
			return res.status(200).json({
				status: true,
				message: 'User deleted successfully',
				data: deleteUser
			});
		} catch (error) {
			next(error);
		}
	}
};
