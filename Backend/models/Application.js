const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
 phone: {
    type: String,
    required: false,
  },
  resume: {
    type: String,
    required: false,
  },

  status: {
    type: String,
    enum: [
      "Applied",
      "Shortlisted",
      "Interview",
      "Rejected",
      "Hired",
    ],
    default: "Applied",
  },


  timeline: [
    {
      status: String,
      date: { type: Date, default: Date.now },
    },
  ],

  interview: {
    date: Date,
    time: String,
    mode: String, // Zoom / In-person
  },

}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
