const mongoose = require("mongoose");
const Job = require("../models/Job");
const Apply = require("../models/Application");
const User = require("../models/User");

exports.createJob = async (req, res) => {
  try {
    const { title, description, location, company, salary, experience, skillsRequired, employmentType, responsibility,closeDate } = req.body;
    if (!title || !description || !company || !location)
      return res.status(400).json({ message: "Required fields missing" });

    const newJob = new Job({ recruiterId: req.userId, title, description, location, company, salary, experience, skillsRequired, employmentType, responsibility,closeDate });
    await newJob.save();
    await User.findByIdAndUpdate(req.userId, { $inc: { totalJobsPosted: 1 } });

    res.status(201).json({ message: "Job created", job: newJob });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.recruiterId.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });

    const allowed = ["title","description","location","company","salary","experience","skillsRequired","employmentType","responsibility","status"];
    const updates = {};
    for(const key in req.body) if(allowed.includes(key)) updates[key] = req.body[key];

    const updated = await Job.findByIdAndUpdate(req.params.jobId, { $set: updates }, { new: true });
    res.json({ message: "Job updated", job: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.recruiterId.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });

    await Job.findByIdAndDelete(req.params.jobId);
    await Apply.deleteMany({ jobId: req.params.jobId });

    res.json({ message: "Job deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { page=1, limit=10, q } = req.query;
    const filter = q ? { $text: { $search: q } } : {};
    const skip = (page-1)*limit;

    const jobs = await Job.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt:-1 });
    const total = await Job.countDocuments(filter);

    res.json({ totalJobs: total, page: Number(page), perPage: Number(limit), jobs });
  } catch(err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const job = await Job.findById(jobId).populate("recruiterId", "name company");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ job });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.userId }).sort({ createdAt:-1 });
    res.json({ totalJobs: jobs.length, jobs });
  } catch(err){
    console.log(err);
    res.status(500).json({ message:"Server error" });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if(!job) return res.status(404).json({ message:"Job not found" });
    if(job.recruiterId.toString() !== req.userId) return res.status(403).json({ message:"Forbidden" });

    const applications = await Apply.find({ jobId: req.params.jobId }).populate("userId","name email phone");
    res.json({ total: applications.length, applications });
  } catch(err){
    console.log(err);
    res.status(500).json({ message:"Server error" });
  }
};
