const pasport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const prisma = new PrismaClient();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;

pasport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await prisma.user.upsert({
          where: { email: profile.emails[0].value },
          update: { google_id: profile.id },
          create: {
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            is_verified: true,
            image_url: profile.photos[0].value,
            email: profile.emails[0].value,
            google_id: profile.id,
          },
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
