const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = process.env;
const { sendMail } = require("../libs/nodemailer");

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

      let exists = await prisma.user.findFirst({ where: { email } });
      if (exists) {
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

      let token = jwt.sign({ id: user.id }, JWT_SECRET);
      let url = `${req.protocol}://${req.get(
        "host"
      )}/verifikasi?token=${token}`;
      let emailContent = `Tautan verifikasi Email: ${url}`;

      await sendMail(user.email, "Verifikasi Email", emailContent);
      delete user.password;

      res.status(200).json({
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

      if (!user.is_verified) {
        let token = jwt.sign({ id: user.id }, JWT_SECRET);
        let url = `${req.protocol}://${req.get(
          "host"
        )}/verifikasi?token=${token}`;
        let emailContent = `Tautan verifikasi Email: ${url}`;

        await sendMail(user.email, "Verifikasi Email", emailContent);

        return res.status(400).json({
          status: false,
          message:
            "Silahkan verifikasi email Anda. Tautan verifikasi telah dikirim ke email Anda",
          data: null,
        });
      }

      let token = jwt.sign({ id: user.id }, JWT_SECRET);
      delete user.password;

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

  verifyEmail: async (req, res, next) => {
    try {
      const { token } = req.query;

      jwt.verify(token, JWT_SECRET, async (err, data) => {
        if (err) {
          return res.status(400).json({
            status: false,
            message: "Gagal diverifikasi",
            data: null,
          });
        }

        await prisma.user.update({
          data: { is_verified: true },
          where: { id: data.id },
        });

        res.status(200).json({
          status: true,
          message: "Verifikasi Sukses",
          data: null,
        });
      });
    } catch (error) {
      next(error);
    }
  },
};
