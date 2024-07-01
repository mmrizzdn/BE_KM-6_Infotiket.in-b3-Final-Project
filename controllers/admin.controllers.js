const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

module.exports = {
	createAdmin: async (req, res, next) => {
		try {
			let { first_name, last_name, email, password, confirmPassword } =
				req.body;
			if (
				!first_name ||
				!last_name ||
				!email ||
				!password ||
				!confirmPassword
			) {
				return res.status(400).json({
					status: false,
					message: 'Semua kolom harus diisi!',
					data: null
				});
			}

			let exists = await prisma.user.findFirst({ where: { email } });
			if (exists) {
				if (exists.google_id) {
					return res.status(400).json({
						status: false,
						message:
							'Sepertinya Anda mendaftar menggunakan Google. Mohon masuk dengan Google.',
						data: null
					});
				}

				return res.status(400).json({
					status: false,
					message: 'Email sudah digunakan sebelumnya!',
					data: null
				});
			}

			if (!password || !confirmPassword) {
				return res.status(400).json({
					status: false,
					message: 'Kata sandi diperlukan!',
					data: null
				});
			}

			if (password !== confirmPassword) {
				return res.status(400).json({
					status: false,
					message: 'Kata sandi tidak cocok!',
					data: null
				});
			}

			let encryptPassword = await bcrypt.hash(password, 10);
			let userData = {
				first_name,
				last_name,
				is_verified: true,
				email,
				password: encryptPassword,
				role: 'admin'
			};

			let user = await prisma.user.create({ data: userData });
			delete user.password;

			res.status(200).json({
				status: true,
				message:
					'Akun berhasil dibuat. Silahkan periksa email Anda untuk verifikasi!',
				data: user
			});
		} catch (error) {
			console.error('Error creating admin:', error);
			throw error;
		}
	},
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

			if (users.length === 0) {
				return res.status(404).json({
					status: false,
					message: 'user not found',
					data: null
				});
			}

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

			if (req.user.id === id) {
				return res.status(400).json({
					status: false,
					message: 'you cannot delete yourself',
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
