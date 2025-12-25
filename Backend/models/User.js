const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ["jobseeker", "recruiter"], required: true },

  otp: String,
  otpExpire: Date,
  isVerified: { type: Boolean, default: false },

  phone: String,
  address: String,
  skills: [String],
  education: [{ school: String, degree: String, year: String }],
  experience: [{ company: String, title: String, years: String }],

  company: String,
  companyWebsite: String,
  totalJobsPosted: { type: Number, default: 0 },

  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],

  profileImage: {
    type: String,
    default: null,
  },

  // ✅ ADD THIS (FIX)
  resume: {
    type: String,
    default: null,
  },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
