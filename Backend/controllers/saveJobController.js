const User = require("../models/User");
const Job = require("../models/Job");

exports.saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if(!job) return res.status(404).json({ message:"Job not found" });

    const user = await User.findById(req.userId);
    if(!user.savedJobs.includes(job.id)) {
      user.savedJobs.push(job.id);
      await user.save();
    }

    res.json({ message:"Job saved" });
  } catch(err){
    console.log(err);
    res.status(500).json({ message:"Server error" });
  }
};

exports.unsaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== req.params.jobId);
    await user.save();
    res.json({ message:"Job removed" });
  } catch(err){
    console.log(err);
    res.status(500).json({ message:"Server error" });
  }
};

exports.getSavedJobs = async (req,res)=>{
  try{
    const user = await User.findById(req.userId).populate("savedJobs");
    res.json({ totalJobs: user.savedJobs.length, savedJobs: user.savedJobs });
  }catch(err){
    console.log(err);
    res.status(500).json({ message:"Server error" });
  }
};
