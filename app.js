require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const PORT = 3000 || process.env;

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
// const file = fs.readFileSync("./api-docs.yaml", "utf-8");
// const swaggerDocument = YAML.parse(file);

// All Routers
// Api Docs
// app.use("/api/v1/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Api Login and Register
const router = require("./routes/route.index");
app.use("/", router);

// Api Bandara
const routerAirport = require("./routes/route.airport");
app.use("/api/v1", routerAirport);

// Api Profile
const routerProfile = require("./routes/route.profile");
app.use("/api/v1", routerProfile);

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "welcome to infotiket.in API!",
    data: null,
  });
})

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

app.listen(PORT, () => console.info(`App listening on port ${PORT}!`));

module.exports = app;
