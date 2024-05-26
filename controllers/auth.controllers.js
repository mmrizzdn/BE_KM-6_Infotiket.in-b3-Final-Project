const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = process.env;

module.exports = {
  register: async (req, res, next) => {
    try {
      let { first_name, last_name, email, password } = req.body;
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
          status: false,
          message: "Semua kolom harus diisi!",
          data: null,
        });
      }

      let exits = await prisma.user.findFirst({ where: { email } });
      if (exits) {
        return res.status(400).json({
          status: false,
          message: "Email sudah digunakan sebelumnya!",
          data: null,
        });
      }

      let encryptPassword = await bcrypt.hash(password, 10);
      let userData = {
        first_name,
        last_name,
        email,
        password: encryptPassword,
      };

      let user = await prisma.user.create({ data: userData });
      delete user.password;

      return res.status(201).json({
        status: true,
        message:
          "Akun berhasil dibuat. Silahkan periksa email Anda untuk verifikasi!",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "Kolom email dan password harus diisi!",
          data: null,
        });
      }

      let user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "Email atau kata sandi tidak valid!",
          data: null,
        });
      }

      let isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          status: false,
          message: "Email atau kata sandi tidak valid!",
          data: null,
        });
      }

      delete user.password;
      let token = jwt.sign({ id: user.id }, JWT_SECRET);

      res.json({
        status: true,
        message: "Anda telah berhasil masuk!",
        data: { ...user, token },
      });
    } catch (error) {
      next(error);
    }
  },

  firstPage: async (req, res, next) => {
    try {
      res.json({
        status: true,
        message: "Selamat Datang di website Infotiket.in!",
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  },
};
