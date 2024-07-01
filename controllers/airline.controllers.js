const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const path = require('path');

const imageKit = require('../libs/imageKit');

module.exports = {
	createAirline: async (req, res, next) => {
		try {
			let { name, short_name, iata_code } = req.body;

			if (!name || !short_name || !iata_code) {
				return res.status(400).json({
					status: false,
					message: 'name, short_name, and iata_code required!',
					data: null
				});
			}

			if (req.file) {
				const strFile = req.file.buffer.toString('base64');

				const uploadFile = await imageKit.upload({
					fileName: Date.now() + path.extname(req.file.originalname),
					file: strFile
				});

				if (uploadFile && uploadFile.url) {
					imageUrl = uploadFile.url;
				} else {
					return res.status(400).json({
						status: false,
						message: 'upload image failed!',
						data: null
					});
				}
			}

			let airline = await prisma.airline.create({
				data: {
					name,
					short_name,
					icon_url: imageUrl,
					iata_code
				}
			});

			res.status(201).json({
				status: true,
				message: 'airline created successfully!',
				data: airline
			});
		} catch (error) {
			next(error);
		}
	},

	getAllAirlines: async (req, res, next) => {
		try {
			let airlines = await prisma.airline.findMany();

			if (!airlines) {
				return res.status(404).json({
					status: false,
					messsage: 'airlines not found!',
					data: null
				});
			}
			res.status(200).json({
				status: true,
				message: 'get all airlines success!',
				data: airlines
			});
		} catch (error) {
			next(error);
		}
	},

	getAirlineById: async (req, res, next) => {
		try {
			let id = Number(req.params.id);
			let airline = await prisma.airline.findUnique({
				where: { id }
			});

			if (!airline) {
				return res.status(404).json({
					status: false,
					messsage: 'airline not found!',
					data: null
				});
			}
			res.status(200).json({
				status: true,
				message: 'get an airline success!',
				data: airline
			});
		} catch (error) {
			next(error);
		}
	},

	updateAirline: async (req, res, next) => {
		try {
			let id = Number(req.params.id);
			let { name, short_name, icon_url, iata_code } = req.body;

			let airline = await prisma.airline.findUnique({
				where: { id }
			});

			if (!airline) {
				return res.status(404).json({
					status: false,
					message: 'airline not found!',
					data: null
				});
			}

			let updatedAirline = await prisma.airline.update({
				where: { id },
				data: {
					name,
					short_name,
					icon_url,
					iata_code
				}
			});

			res.status(200).json({
				status: true,
				message: 'airline updated successfully!',
				data: updatedAirline
			});
		} catch (error) {
			next(error);
		}
	},

	deleteAirline: async (req, res, next) => {
		try {
			let id = Number(req.params.id);

			let airline = await prisma.airline.findUnique({
				where: { id }
			});

			if (!airline) {
				return res.status(404).json({
					status: false,
					message: 'airline not found!',
					data: null
				});
			}

			let deletedAirline = await prisma.airline.delete({
				where: { id }
			});

			res.status(200).json({
				status: true,
				message: 'airline deleted successfully!',
				data: deletedAirline
			});
		} catch (error) {
			next(error);
		}
	}
};
