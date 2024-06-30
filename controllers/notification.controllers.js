const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  getAllNotification: async (req, res, next) => {
    try {
      let user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      const notifications = await prisma.notification.findMany({
        where: {
          user_id: req.user.id,
        },
      });

      console.info("Berhasil menyimpan notifikasi: ", notifications);
      return res.status(200).json({
        status: true,
        message: "Berhasil menampilkan data notifikasi",
        data: notifications,
      });
    } catch (error) {
      console.error("Gagal untuk menyimpan notifikasi: ", error);
      next(error);
    }
  },

  getIdNotification: async (req, res, next) => {
    try {
      let { first_name, last_name } = req.body;
      const user_id = Number(req.params.id);

      const user = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
      });

      let message = "";

      if (!user) {
        message = "User not found";
      }

      const notifications = await prisma.notification.findMany({
        where: {
          user_id: user_id,
        },
      });
      console.info("Berhasil menyimpan notifikasi: ", notifications);
      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notifications);
      return res.status(200).json({
        status: true,
        message: "Berhasil menampilkan data notifikasi",
        data: notifications,
      });
    } catch (error) {
      console.error("Gagal untuk menyimpan notifikasi: ", error);
      next(error);
    }
  },
};
