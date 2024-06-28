const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const imageKit = require("../libs/imageKit");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const path = require("path");

module.exports = {
  profileGet: async (req, res, next) => {
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

  profilePut: async (req, res, next) => {
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
          title: "Pengguna Login",
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
};
