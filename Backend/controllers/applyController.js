const Apply = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const mongoose = require("mongoose");

// JobSeeker applies to a job
exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId))
      return res.status(400).json({ message: "Invalid Job ID" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

let resumePath = req.file ? req.file.filename : null;

    if (!resumePath) {
      const user = await User.findById(req.userId);
      if (user?.resume) resumePath = user.resume;
    }
    if (!resumePath) {
  resumePath = ""; // temporary allow empty resume
}


    const alreadyApplied = await Apply.findOne({
      job: job._id,
      applicant: req.userId,
    });
    if (alreadyApplied)
      return res.status(400).json({ message: "Already applied" });

    const application = await Apply.create({
      job: job._id,
      applicant: req.userId,
      resume: resumePath,
      timeline: [{ status: "Applied" }],
    });

    res.status(201).json({ message: "Applied successfully", application });
  } catch (err) {
    console.log("applyJob Error:", err);
    res.status(500).json({ message: "Server error while applying" });
  }
};

// JobSeeker fetches their applications
exports.myApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { applicant: req.userId };
    if (status) filter.status = status;

    const applications = await Apply.find(filter)
      .populate("job", "title company location") // select needed fields
      .sort({ appliedAt: -1 });

    res.json({ total: applications.length, applications });
  } catch (err) {
    console.log("myApplications Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Withdraw application
exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Application ID" });

    const application = await Apply.findOne({ _id: id, applicant: req.userId });
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (["Interview", "Hired"].includes(application.status))
      return res.status(400).json({ message: "Cannot withdraw at this stage" });

    await application.deleteOne();
    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.log("withdrawApplication Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Recruiter fetch applications for their job
exports.getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId))
      return res.status(400).json({ message: "Invalid Job ID" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // ensure recruiter owns the job
    if (job.recruiterId.toString() !== req.userId)
      return res.status(403).json({ message: "Forbidden" });

    const applications = await Apply.find({ job: jobId })
      .populate("applicant", "name email phone resume") // fetch applicant info
      .populate("job", "title") // fetch job info
      .sort({ appliedAt: -1 });

    res.json({ total: applications.length, applications });
  } catch (err) {
    console.log("getApplicationsForJob Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const application = await Apply.findById(id).populate("job");
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    // ensure recruiter owns the job
    if (application.job.recruiterId.toString() !== req.userId)
      return res.status(403).json({ message: "Forbidden" });

    application.status = status;
    await application.save();

    res.json({ message: "Status updated", status });
  } catch (err) {
    console.log("updateApplicationStatus Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getRecruiterDashboardSummary = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.userId }).select("_id");
    const jobIds = jobs.map(j => j._id);

    const apps = await Apply.find({ job: { $in: jobIds } });

    res.json({
      totalJobs: jobs.length,
      totalApplications: apps.length,
      shortlisted: apps.filter(a => a.status === "Shortlisted").length,
      hired: apps.filter(a => a.status === "Hired").length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
