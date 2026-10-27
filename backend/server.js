require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const salaryRoutes = require("./routes/salary");
const budgetRoutes = require("./routes/budget");
const categoryRoutes = require("./routes/categories");
const reportRoutes = require("./routes/reports");

const app = express();

const allowedOrigins = [
  "https://leafy-meerkat-603428.netlify.app",
  "http://localhost:5173",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

app.use(cors({ origin: [...new Set(allowedOrigins)] }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, service: "ledgerly-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    "\n⚠️  MONGODB_URI is empty in backend/.env — fill it in with your MongoDB Atlas (or local) connection string before starting the server.\n"
  );
}

async function start() {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log("✅ Connected to MongoDB");
    }
    app.listen(PORT, () => console.log(`🚀 Ledgerly API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

start();