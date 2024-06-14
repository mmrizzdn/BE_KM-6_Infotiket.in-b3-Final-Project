require("dotenv").config();
require("./libs/cron");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const port = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

app.use(express.urlencoded());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Swagger
// const swaggerUI = require("swagger-ui-express");
// const YAML = require("yaml");
// const fs = require("fs");
// const file = fs.readFileSync("./api-docs.yaml", "utf-8");
// const swaggerDocument = YAML.parse(file);

// All Routers
// Api Docs
// app.use("/api/v1/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

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

// 404 halaman tidak ditemukan
app.use((req, res, next) => {
  return res.status(404).json({
    status: false,
    message: "Halaman Tidak Ditemukan 404 ",
    err: `Cannot find ${req.url}`,
    data: null,
  });
});

// 500 Kesalahan Server Internal
app.use((err, req, res, next) => {
  console.info(err);
  return res.status(500).json({
    status: false,
    message: "Kesalahan Server Internal",
    err: err.message,
    data: null,
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log("app listening on port", port);
});

module.exports = app;
