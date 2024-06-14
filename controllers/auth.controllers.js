const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { JWT_SECRET } = process.env;
const { getHTML, sendMail } = require("../libs/nodemailer");

module.exports = {
  register: async (req, res, next) => {
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
      let url = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verifikasi?token=${token}`;
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

      if (!user.password && user.google_id) {
        return res.status(400).json({
          status: false,
          message:
            "Sepertinya Anda telah mendaftar dengan Google. Silakan masuk menggunakan Google.",
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
        )}/api/v1/auth/verifikasi?token=${token}`;
        console.info(url);
        let html = await getHTML("verification-email.ejs", {
          verification_url: url,
        });

        await sendMail(user.email, "Verifikasi Email", html);

        return res.status(400).json({
          status: false,
          message:
            "Silahkan verifikasi email Anda. Tautan verifikasi telah dikirim ke email Anda",
          data: null,
        });
      }

      delete user.password;
      let token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "1d",
      });
      const protocol = req.protocol;
      const host = req.get("host");
      const redirectUrl = `${protocol}://${host}/api/v1/auth/halaman-utama`;
      console.info(token);
      return res.status(200).json({
        status: true,
        message: "Berhasil Login",
        data: { ...user },
        redirectUrl,
        token,
      });
      // return res.redirect("http://localhost:5173");
    } catch (error) {
      next(error);
    }
  },

  firstPage: async (req, res, next) => {
    try {
      const token =
        req.headers.authorization &&
        req.headers.authorization.replace("Bearer ", "");
      if (!token) {
        return res.json({
          status: true,
          message:
            "Selamat Datang di website Infotiket.in! Anda dapat melihat halaman ini tanpa login.",
          data: null,
        });
      }
      res.json({
        status: true,
        message: "Selamat Datang di website Infotiket.in!",
        data: { token: token },
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
          data: {
            token,
          },
        });
      });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          status: false,
          message: "Email tidak ditemukan!",
          data: null,
        });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "Pengguna tidak ditemukan!",
          data: null,
        });
      }

      let token = jwt.sign({ id: user.id }, JWT_SECRET);
      let resetPassUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/mengatur-ulang-kata-sandi?token=${token}`;
      console.info(resetPassUrl);
      let html = await getHTML("forgot-password.ejs", {
        verification_url: resetPassUrl,
      });

      await sendMail(user.email, "Mengatur ulang kata sandi", html);

      return res.status(200).json({
        status: true,
        message: "Silahkan periksa email Anda untuk atur ulang kata sandi!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    if (req.method === "GET") {
      const token = req.query.token;
      return res.render("reset-password.ejs", { token: token });
    }

    if (req.method === "POST") {
      try {
        const { token, password, confirmPassword } = req.body;

        console.info(token);
        console.info(password);
        console.info(confirmPassword);

        if (!token || !password || !confirmPassword) {
          return res.status(400).json({
            status: false,
            message: "Kata sandi baru diperlukan!",
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

        let decodedToken;
        try {
          decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (error) {
          return res.status(400).json({
            status: false,
            message: "Token tidak valid atau sudah kedaluwarsa!",
            data: null,
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: decodedToken.id },
        });

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Pengguna tidak ditemukan!",
            data: null,
          });
        }

        const encryptPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
          where: { id: decodedToken.id },
          data: { password: encryptPassword },
        });

        return res.status(200).json({
          status: true,
          message: "Kata sandi berhasil direset!",
          data: {
            token,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  },

  googleOauth2: (req, res) => {
    try {
      let token = jwt.sign({ id: req.user.id }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true });
      const protocol = req.protocol;
      const host = req.get("host");
      const redirectUrl = `${protocol}://${host}/api/v1/auth/halaman-utama`;
      return res.redirect(redirectUrl);
      // return res.redirect("http://localhost:5173");
    } catch (error) {
      next(error);
    }
  },

  logout: (req, res) => {
    try {
      req.logout((err) => {
        if (err) {
          console.error(err);
          return res.redirect("/");
        }
        res.redirect("/");
      });
    } catch (error) {
      next(error);
    }
  },
};
