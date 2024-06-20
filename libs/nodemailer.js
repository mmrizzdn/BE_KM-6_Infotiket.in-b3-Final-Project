const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const ejs = require("ejs");

require("dotenv").config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } =
  process.env;

const ouath2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);

ouath2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

module.exports = {
  sendMail: async (to, subject, html) => {
    try {
      let accessToken = await ouath2Client.getAccessToken();
      let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "renggadwipribadi@gmail.com",
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          refreshToken: GOOGLE_REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      transport.sendMail({ to, subject, html });
    } catch (error) {
      // next(error);
    }
  },

  getHTML: (fileName, data) => {
    return new Promise((resolve, reject) => {
      const path = `${__dirname}/../views/${fileName}`;
      ejs.renderFile(path, data, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  },
};
