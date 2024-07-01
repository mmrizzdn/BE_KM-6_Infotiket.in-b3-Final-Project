require("dotenv").config();
require("./libs/cron");

const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./libs/passport");
const path = require("path");
const Sentry = require("@sentry/node");
const helmet = require("helmet");
const DOMAIN = process.env.DOMAIN || "http://localhost:3000";
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://infotiket.in"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use(
  session({
    secret: "fpinfotiketin",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      //   scriptSrc: ["'self'", ""],
      //   styleSrc: ["'self'", ""],
      //   imgSrc: ["'self'", ""],
      connectSrc: ["'self'"],
      //   fontSrc: ["'self'", ""],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const file = fs.readFileSync("./api-docs.yaml", "utf-8");
const swaggerDocument = YAML.parse(file);

// All Routers
// Api Docs
app.use("/api/v1/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Api Admin
const routerAdmin = require("./routes/route.admin");
app.use("/api/v1", routerAdmin);

// Api Login and Register
const authRouter = require("./routes/route.index");
app.use("/api/v1/auth/", authRouter);

// Api Bandara
const routerAirport = require("./routes/route.airport");
app.use("/api/v1", routerAirport);

// Api Airline
const routerAirline = require("./routes/route.airline");
app.use("/api/v1", routerAirline);

// Api Airplane
const routerAirplane = require("./routes/route.airplane");
app.use("/api/v1", routerAirplane);

// Api Flight
const routerFlights = require("./routes/route.find-flight");
app.use("/api/v1", routerFlights);

// Api Profile
const routerProfile = require("./routes/route.profile");
app.use("/api/v1", routerProfile);

// Api Passenger
const routerPassenger = require("./routes/route.passenger");
app.use("/api/v1", routerPassenger);

// Api Booking
const routerBooking = require("./routes/route.booking");
app.use("/api/v1", routerBooking);

// Api BookingWithPassengers
const routerBookingWithPassengers = require("./routes/route.booking&passenger");
app.use("/api/v1", routerBookingWithPassengers);

// Api Transaction
const routerTransaction = require("./routes/route.transaction");
app.use("/api/v1", routerTransaction);

// Api ticket and webhook
const routerWebhookTicket = require("./routes/route.webhook_ticket");
app.use("/api/v1", routerWebhookTicket);

// Api Notification
const routerNotification = require("./routes/route.notification");
app.use("/api/v1", routerNotification);

// Api Groq
const routerGroq = require("./routes/route.groq");
app.use("/api/v1", routerGroq);

// 404 halaman tidak ditemukan
app.use((req, res, next) => {
  return res.status(404).json({
    status: false,
    message: "Halaman Tidak Ditemukan 404 ",
    err: `Cannot find ${req.url}`,
    data: null,
  });
});

Sentry.setupExpressErrorHandler(app);

// 500 Kesalahan Server Internal
app.use((err, req, res, next) => {
  return res.status(500).json({
    status: false,
    message: "Kesalahan Server Internal",
    err: err.message,
    data: null,
  });
});

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://infotiket.in"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

module.exports = app;
