require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();

/* ===============================
   Middleware (order matters)
================================ */

// Logging first (fast feedback)
app.use(morgan("dev"));

// Body parsing (Express built-in → less overhead)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// CORS (after parsers)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

/* ===============================
   Routes
================================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    db: "connected",
  });
});

/* ===============================
   404 Handler (must be last route)
================================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ===============================
   Global Error Handler
================================ */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ===============================
   Server + DB Bootstrap
================================ */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // ⬅️ wait for DB
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    process.exit(1);
  }
};

startServer();
