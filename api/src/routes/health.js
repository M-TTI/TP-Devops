const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({
      status: "ok",
      api: "OK",
      db: "OK",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      api: "OK",
      db: "ERROR",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/ready", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({
      status: "ok",
    });
  } catch {
    res.status(503).json({
      status: "error",
    });
  }
});

module.exports = router;
