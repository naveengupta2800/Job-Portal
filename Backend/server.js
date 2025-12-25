require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const jobsRoutes = require("./routes/jobsRoutes"); // make sure file name matches exactly
const applyRoutes = require("./routes/applyRoutes");
const saveJobRoutes = require("./routes/saveJobRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Initialize app
const app = express();

// Middleware
app.use(express.json());
// Express backend example
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,
}));




// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: false,         // localhost ke liye false
    sameSite: "lax",      // cross-origin support
    maxAge: 24 * 60 * 60 * 1000,
  }
}));




// Connect to MongoDB
connectDB();

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes); 
app.use("/api/apply", applyRoutes);
app.use("/api/save", saveJobRoutes);
app.use("/api/profile",profileRoutes);
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


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
