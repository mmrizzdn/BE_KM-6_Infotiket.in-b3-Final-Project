const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  getAllNotification: async (req, res, next) => {
    try {
      const user_id = Number(req.user.id);

      const notifications = await prisma.notification.findUnique({
        where: {
          id: user_id,
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
