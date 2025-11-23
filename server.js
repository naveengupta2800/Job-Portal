const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const nodemailer = require('nodemailer');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT;

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, //secure:true when using https
  })
);

// MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('DB Error:', err));


// USER SCHEMA
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: { type: String, unique: true },
  role: { type: String, enum:['jobseeker', 'recruiter'], required: true },

  otp: String,
  otpExpire: Date,
  isVerified: { type: Boolean, default: false },

});
const User = mongoose.model('User', userSchema);

// Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

//-------------------------Auth Routes---------------------------------------
// REGISTER API
app.post('/register', async(req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    if (!['jobseeker', 'recruiter'].includes(role))
      return res.status(400).json({ message: 'Invalid role selected' });

    // Check email exists
    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10*60*1000); 

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpire,
    });

    req.session.email = email;
    await user.save();

    // Send OTP
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP is ${otp}`,
    });

   return res.json({ message: 'User registered, OTP sent' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// VERIFY OTP
app.post('/verify', async (req, res) => {
  try {
    const { otp } = req.body;

    if(!otp) 
      return res.status(400).json({message: 'OTP is required'});
    const email = req.session.email;

    if (!email) return res.status(400).json({ message: 'Session expired' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (user.otpExpire && user.otpExpire < new Date())
      return res.status(400).json({ message: 'OTP expired. Please register again.' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// LOGIN
app.post('/login', async(req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email & Password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    req.session.token = token;
    req.session.userId = user.id;

    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
