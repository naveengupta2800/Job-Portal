const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 60000,
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((err) => {
  if (err) console.log("Mail transporter error:", err);
  else console.log("Mail transporter ready");
});

module.exports = transporter;
