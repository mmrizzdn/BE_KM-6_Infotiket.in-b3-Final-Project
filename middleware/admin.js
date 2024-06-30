module.exports = {
  isAdmin: (req, res, next) => {
    try {
      let { role } = req.user;
      if (role === "admin") {
        next();
      } else {
        res.status(401).json({
          status: false,
          message: "Maaf anda bukan Admin, Silahkan login dengan akun Admin!",
          data: null,
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
