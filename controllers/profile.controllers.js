const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const imageKit = require("../libs/imageKit");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const path = require("path");
const { getHTML, sendMail } = require("../libs/nodemailer");

module.exports = {
  createProfile: async (req, res, next) => {
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
          message: "Semua kolom harus diisi!",
          data: null,
        });
      }

      let exists = await prisma.user.findFirst({ where: { email } });
      if (exists) {
        if (exists.google_id) {
          return res.status(400).json({
            status: false,
            message:
              "Sepertinya Anda mendaftar menggunakan Google. Mohon masuk dengan Google.",
            data: null,
          });
        }

        return res.status(400).json({
          status: false,
          message: "Email sudah digunakan sebelumnya!",
          data: null,
        });
      }

      if (!password || !confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Kata sandi diperlukan!",
          data: null,
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Kata sandi tidak cocok!",
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
      let url = `http://localhost:5173/verifikasi-email?token=${token}`;
      console.info(url);
      let html = await getHTML("verification-email.ejs", {
        verification_url: url,
      });

      await sendMail(user.email, "Verifikasi Email", html);
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

  getAllProfile: async (req, res, next) => {
    try {
      let user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.statius(404).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }
      const users = await prisma.user.findMany();

      return res.status(200).json({
        status: true,
        message: "Berhasil semua mengambil data profil",
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req, res, next) => {
    try {
      let user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.statius(404).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      delete user.password;
      let token = jwt.sign({ id: user.id }, JWT_SECRET);
      const { first_name, last_name, email, image_url } = user;

      return res.status(200).json({
        status: true,
        message: "Berhasil mengambil data",
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      let user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      let imageUrl = user.image_url;
      if (req.file) {
        const strFile = req.file.buffer.toString("base64");

        const uploadFile = await imageKit.upload({
          fileName: Date.now() + path.extname(req.file.originalname),
          file: strFile,
        });

        if (uploadFile && uploadFile.url) {
          imageUrl = uploadFile.url;
        } else {
          console.error("Gagal mengunggah gambar ke ImageKit");
          return res.status(500).json({
            status: false,
            message: "Gagal mengunggah gambar",
            data: null,
          });
        }
      }

      const { first_name, last_name, email, password, confirmPassword } =
        req.body;

      let updateData = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (email) updateData.email = email;
      updateData.image_url = imageUrl;

      if (password) {
        if (password !== confirmPassword) {
          return res.status(400).json({
            status: false,
            message: "Kata sandi tidak cocok!",
            data: null,
          });
        }
        updateData.password = await bcrypt.hash(password, 10);
      }

      const userUpdate = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
      });

      delete userUpdate.password;
      let token = jwt.sign({ id: user.id }, JWT_SECRET);

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna memperbaharui profil",
          message: `Kamu telah memperbaharui profil, ${user.first_name} ${user.last_name}.`,
          user_id: user.id,
        },
      });
      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notification);

      return res.status(200).json({
        status: true,
        message: "Berhasil memperbaharui profil",
        data: { userUpdate, token },
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProfile: async (req, res, next) => {
    try {
      let id = Number(req.params.id);
      let user = await prisma.user.findUnique({ where: { id: id } });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "user not found",
          data: null,
        });
      }

      let bookings = await prisma.booking.findMany({
        where: { user_id: id },
      });

      if (bookings.length > 0) {
        for (let booking of bookings) {
          await prisma.payment.deleteMany({
            where: {
              booking_id: booking.id,
            },
          });

          await prisma.ticket.deleteMany({
            where: { booking_id: booking.id },
          });

          await prisma.passenger.deleteMany({
            where: { booking_id: booking.id },
          });
        }
      }

      await prisma.booking.deleteMany({
        where: { user_id: id },
      });

      await prisma.notification.deleteMany({
        where: { user_id: id },
      });

      let deleteProfile = await prisma.user.delete({ where: { id } });
      return res.status(200).json({
        status: true,
        message: "Berhasil menghapus profil",
        data: deleteProfile,
      });
    } catch (error) {
      next(error);
    }
  },
};
