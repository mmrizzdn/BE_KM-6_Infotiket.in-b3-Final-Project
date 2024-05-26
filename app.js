require("dotenv").config();
const express = require("express");
const PORT = 3000 || process.env;

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

// Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const file = fs.readFileSync("./api-docs.yaml", "utf-8");
const swaggerDocument = YAML.parse(file);

// All Routers
// Api Docs
app.use("/api/v1/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Api Bandara
const router = require("./routes/route.airport");
app.use("/api/v1", router);

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
