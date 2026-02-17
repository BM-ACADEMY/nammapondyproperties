require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");

// Import all routes
const roleRoutes = require("./routes/roleRoute");
const userRoutes = require("./routes/userRoute");
const propertyRoutes = require("./routes/propertyRoute");
const propertyAttributeRoutes = require("./routes/propertyAttributeRoute");
const reviewRoutes = require("./routes/reviewRoute");
const whatsappLeadRoutes = require("./routes/whatsappLeadRoute");
const websiteSettingRoutes = require("./routes/websiteSettingRoute");
const socialMediaRoutes = require("./routes/socialMediaRoute");
const testimonialRoutes = require("./routes/testimonialRoute");
const enquiryRoutes = require("./routes/enquiryRoute");
const businessTypeRoutes = require("./routes/businessTypeRoute");
const propertyTypeRoutes = require("./routes/propertyTypeRoute");
const approvalTypeRoutes = require("./routes/approvalTypeRoute");
const sellerRequestRoutes = require("./routes/sellerRequestRoute");

const app = express();

/* ===============================
   Middleware (order matters)
================================ */

// Logging first (fast feedback)
app.use(morgan("dev"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (ensure this is before routes or handled correctly)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Cookies
app.use(cookieParser());

// CORS (after parsers)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // better default than *
    credentials: true,
  }),
);

/* ===============================
   Routes
================================ */

// Root & Health check
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
    db: "connected", // you can make this dynamic later if needed
  });
});

// API Routes (versioned under /api)
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/property-attributes", propertyAttributeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/whatsapp-leads", whatsappLeadRoutes);
app.use("/api/website-settings", websiteSettingRoutes);
app.use("/api/social-media", socialMediaRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/business-types", businessTypeRoutes);
app.use("/api/property-types", propertyTypeRoutes);
app.use("/api/approval-types", approvalTypeRoutes);
app.use("/api/seller-requests", sellerRequestRoutes);

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
  console.error("❌ Error:", err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* ===============================
   Server + DB Bootstrap
================================ */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
