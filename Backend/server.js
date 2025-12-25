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

const app = express();

// ------------ TRUST PROXY (Render Required) ------------
app.set("trust proxy", 1);

// ------------ BODY PARSERS ------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------ CORS (FINAL STABLE) ------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://job-portal-plum-alpha.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// ❌❌ THIS WAS CAUSING CRASH — REMOVED ❌❌
// app.options("*", cors());

// ------------ SESSION ------------
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

// ------------ DB CONNECT ------------
connectDB();

// ------------ ROUTES ------------
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/apply", applyRoutes);
app.use("/api/save", saveJobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Job Portal API is running...");
});

// ------------ ERROR HANDLER ------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// ------------ START SERVER ------------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
