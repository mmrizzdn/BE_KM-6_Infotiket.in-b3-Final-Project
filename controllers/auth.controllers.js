const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = process.env;
const { getHTML, sendMail } = require("../libs/nodemailer");

const validateName = (name) => /^[A-Za-z]+$/.test(name);

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const minLength = 6;
  return password.length >= minLength;
};

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

      if (!validateName(first_name) || !validateName(last_name)) {
        return res.status(400).json({
          status: false,
          message: "Nama depan dan nama belakang hanya boleh berisi huruf!",
          data: null,
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          status: false,
          message: "Format email tidak valid!",
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

      if (!validatePassword(password)) {
        return res.status(400).json({
          status: false,
          message: "Kata sandi harus minimal 6 karakter!",
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
      let url = `https://infotiket.in/verifikasi-email?token=${token}`;
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
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      let { first_name, last_name, email, password } = req.body;
      // validasi email dan password
      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "Kolom email dan password harus diisi!",
          data: null,
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          status: false,
          message: "Format email tidak valid!",
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

      if (!validatePassword(password)) {
        return res.status(400).json({
          status: false,
          message: "Kata sandi harus minimal 6 karakter!",
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
        const now = new Date();
        const ONE_MINUTE = 60 * 1000;
        if (
          user.email_verification_attempts >= 3 &&
          user.last_verification_attempt &&
          now - user.last_verification_attempt < ONE_MINUTE
        ) {
          return res.status(429).json({
            status: false,
            message:
              "Anda telah mencapai batas verifikasi. Silakan coba lagi dalam 1 menit.",
            data: null,
          });
        }

        let token = jwt.sign({ id: user.id }, JWT_SECRET);
        let url = `https://infotiket.in/verifikasi-email?token=${token}`;
        console.info(url);

        let html = await getHTML("verification-email.ejs", {
          verification_url: url,
        });

        await sendMail(user.email, "Verifikasi Email", html);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            email_verification_attempts: {
              increment: 1,
            },
            last_verification_attempt: now,
          },
        });

        return res.status(200).json({
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

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna Login",
          message: `Hai ${user.first_name} ${user.last_name}, selamat datang di website Infotiket.in!`,
          user_id: user.id,
        },
      });
      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notification);

      return res.status(200).json({
        status: true,
        message: "Berhasil Login",
        data: { ...user },
        redirectUrl,
        token,
      });
      // return res.redirect("http://localhost:5173");
    } catch (err) {
      next(err);
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
    } catch (err) {
      next(err);
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

      const now = new Date();
      const ONE_MINUTE = 60 * 1000;
      if (
        user.email_verification_attempts >= 3 &&
        user.last_verification_attempt &&
        now - user.last_verification_attempt < ONE_MINUTE
      ) {
        return res.status(429).json({
          status: false,
          message:
            "Anda telah mencapai batas verifikasi. Silakan coba lagi dalam 1 menit.",
          data: null,
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          email_verification_attempts: {
            increment: 1,
          },
          last_verification_attempt: now,
        },
      });

      let token = jwt.sign({ id: user.id }, JWT_SECRET);
      let resetPassUrl = `https://infotiket.in/mengatur-ulang-kata-sandi?token=${token}`;
      console.info(resetPassUrl);
      let html = await getHTML("forgot-password.ejs", {
        verification_url: resetPassUrl,
      });

      await sendMail(user.email, "Mengatur ulang kata sandi", html);

      return res.status(200).json({
        status: true,
        message: "Silahkan periksa email Anda untuk atur ulang kata sandi!",
        data: {
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  resetPassword: async (req, res, next) => {
    // if (req.method === "GET") {
    //   const token = req.query.token;
    //   return res.render("reset-password.ejs", { token: token });
    // }

    // if (req.method === "POST") {
    try {
      const token = req.query.token;
      const { password, confirmPassword } = req.body;
      console.log(token);
      console.log(password);
      console.log(confirmPassword);

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
    } catch (err) {
      next(err);
    }
    // }
  },

  googleOauth2: async (req, res, next) => {
    try {
      let { first_name, last_name } = req.body;
      const user = req.user;
      delete user.password;

      let token = jwt.sign({ id: req.user.id }, JWT_SECRET, {
        expiresIn: "1d",
      });

      const messageSuccess = "Selamat datang, Anda berhasil login";
      const statusSuccess = true;

      const messageFailure =
        "Gagal melakukan autentikasi dengan Google OAuth2, Silahkan untuk mencoba lagi!";
      const statusFailure = false;

      const redirectUrlSuccess = `https://infotiket.in/auth-callback?token=${encodeURIComponent(
        token
      )}&user=${encodeURIComponent(
        JSON.stringify(user)
      )}&message=${encodeURIComponent(
        JSON.stringify(messageSuccess)
      )}&status=${encodeURIComponent(JSON.stringify(statusSuccess))}`;

      const redirectUrlFailure = `https://infotiket.in/auth-callback?message=${encodeURIComponent(
        JSON.stringify(messageFailure)
      )}&status=${encodeURIComponent(JSON.stringify(statusFailure))}`;

      const notification = await prisma.notification.create({
        data: {
          title: "Pengguna Login",
          message: `Hai ${user.first_name} ${user.last_name}, selamat datang di website Infotiket.in!`,
          user_id: user.id,
        },
      });

      const io = req.app.get("io");
      io.emit(`login`, { first_name, last_name });
      io.emit(`user-${user.id}`, notification);

      const isSuccess = true;

      if (isSuccess) {
        return res.redirect(redirectUrlSuccess);
      } else {
        return res.redirect(redirectUrlFailure);
      }
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized. Please log in.",
          data: null,
        });
      }

      const user_id = req.user.id;

      await prisma.notification.deleteMany({
        where: {
          user_id: user_id,
        },
      });

      const io = req.app.get("io");
      io.emit(`logout`, { user_id });

      return res.status(200).json({
        status: true,
        message: "Berhasil Logout",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  },
};
