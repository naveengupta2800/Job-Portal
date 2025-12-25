require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const applyRoutes = require("./routes/applyRoutes");
const saveJobRoutes = require("./routes/saveJobRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Initialize app
const app = express();

// -------------------- IMPORTANT --------------------
// TRUST PROXY for Render cookies
app.set("trust proxy", 1);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- CORS FIX --------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://job-portal-naveengupta2800s-projects.vercel.app"
    ],
    credentials: true,
  })
);

// -------------------- SESSION --------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// -------------------- DB CONNECT --------------------
connectDB();

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/apply", applyRoutes);
app.use("/api/save", saveJobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.send("Job Portal API is running...");
});

// Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
