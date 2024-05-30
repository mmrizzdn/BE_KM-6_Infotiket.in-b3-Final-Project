const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const imageKit = require("../libs/imageKit");
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

      const { first_name, last_name, email, image_url } = user;
      return res.status(200).json({
        status: true,
        message: "Berhasil mengambil data",
        data: user,
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

      if (password && password !== confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Kata sandi tidak cocok!",
          data: null,
        });
      }

      let updateData = { first_name, last_name, email, image_url: imageUrl };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const userUpdate = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
      });

      delete userUpdate.password;

      return res.status(200).json({
        status: true,
        message: "Berhasil memperbaharui profil",
        data: userUpdate,
      });
    } catch (error) {
      next(error);
    }
  },
};
