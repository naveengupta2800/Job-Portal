const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  location: String,
  company: String,
  salary: String,
  experience: String,
  skillsRequired: [String],
  employmentType: {
    type: String,
    enum: ["Full-Time", "Part-Time", "Internship", "Remote", "Contract"],
  },
  responsibility: [String],
  status: { type: String, enum: ["open", "closed"], default: "open" },
  closeDate: Date
}, { timestamps: true });

JobSchema.index({ title: "text", description: "text", skillsRequired: "text" });

module.exports = mongoose.model("Job", JobSchema);
