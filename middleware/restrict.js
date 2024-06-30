const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  restrict: (req, res, next) => {
    if (req.originalUrl === "/api/v1/auth/halaman-utama") {
      return next();
    }

    let { authorization } = req.headers;
    if (!authorization || !authorization.split(" ")[1]) {
      return res.status(401).json({
        status: false,
        message: "token tidak ada!",
        data: null,
      });
    }

    let token = authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET, async (err, data) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message: err.message,
          data: null,
        });
      }

      let user = await prisma.user.findFirst({
        where: { id: data.id },
      });
      delete user.password;
      req.user = user;
      next();
    });
  },
};
