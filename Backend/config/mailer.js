const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // MUST be true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // this must be your APP PASSWORD
  },
});

// Check connection
transporter.verify((err, success) => {
  if (err) {
    console.log("Mail transporter error:", err);
  } else {
    console.log("Mail transporter ready");
  }
});

module.exports = transporter;
