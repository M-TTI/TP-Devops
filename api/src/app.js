const express = require("express");
const cors = require("cors");
const { middleware: loggerMiddleware, log } = require("./middleware/logger");
const healthRoutes = require("./routes/health");
const productRoutes = require("./routes/products");

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.get("/", (req, res) => {
  res.json({
    name: "ShopLite API",
    version: "0.1.0",
    endpoints: ["/health", "/products"],
  });
});

app.use("/", healthRoutes);
app.use("/products", productRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  log.error(err.message, { request_id: req.requestId });
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
