module.exports = {
	isAdmin: (req, res, next) => {
		try {
			let { role } = req.user;
			if (role === "admin") {
				next();
			} else {
				res.status(401).json({
					status: false,
					message: "Unauthorized",
					data: null,
				});
			}
		} catch (error) {
			next(error);
		}
	},
};
