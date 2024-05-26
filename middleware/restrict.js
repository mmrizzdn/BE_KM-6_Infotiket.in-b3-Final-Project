const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let restrict = (req, res, next) => {
  let { authorization } = req.headers;
  if (!authorization || !authorization.split(" ")[1]) {
    return res.status(401).json({
      status: false,
      message: "Tidak ada token!",
      data: null,
    });
  }

  let token = authorization.split(" ")[1];
  jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
        data: null,
      });
    }

    try {
      let userFromDb = await prisma.user.findFirst({
        where: { id: decodedToken.id },
      });
      if (!userFromDb) {
        return res.status(404).json({
          status: false,
          message: "Pengguna tidak ditemukan",
          data: null,
        });
      }

      delete userFromDb.password;
      req.user = userFromDb;
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = restrict;
