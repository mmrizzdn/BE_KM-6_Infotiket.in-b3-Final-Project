module.exports = {
	isAdmin: (req, res, next) => {
		try {
			let { role } = req.user;
			if (role === "admin") {
				next();
			} else {
				res.status(401).json({ message: "Unauthorized" });
			}
		} catch (error) {
			next(error);
		}
	},
};
