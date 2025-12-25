const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// Helper: generate JWT
const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// REGISTER
exports.register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields required" });

    role = role.toLowerCase();
    if (!["jobseeker", "recruiter"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    email = email.toLowerCase();
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpire,
    });

    await user.save();

    req.session.email = email;
    await sendEmail(email, "Verify OTP", `Your OTP is ${otp}`);

    res.json({ message: "Registered, OTP sent" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// VERIFY OTP
exports.verify = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.session.email;

    if (!email)
      return res.status(400).json({ message: "Session expired" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpire < new Date())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = createToken(user.id);
    req.session.token = token;
    req.session.userId = user.id;
    req.session.email = null;

    res.json({ message: "Email verified", role: user.role });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password)
      return res.status(400).json({ message: "Email & Password required" });

    const email = rawEmail.toLowerCase();
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Verify email first" });

    const token = createToken(user.id);

    req.session.token = token;
    req.session.userId = user.id;

    req.session.save((err) => {
      if (err) {
        console.log("Session save error:", err);
        return res.status(500).json({ message: "Session error" });
      }
      res.json({ message: "Logged in", role: user.role });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err)
      return res.status(500).json({ message: "Logout failed" });

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
};

// GET USER ROLE
exports.getUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ role: user.role });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

