const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  restrict: (req, res, next) => {
    let { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Tidak diizinkan",
        err: "Token tidak ditemukan pada header!",
        data: null,
      });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message: "Tidak diizinkan",
          err: err.message,
          data: null,
        });
      }

      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
      next();
    });
  },
};
