const router = require("express").Router();
const jobController = require("../controllers/jobController");
const requireAuth = require("../middleware/authMiddleware");

// POST: create job
router.post("/create", requireAuth("recruiter"), jobController.createJob);

// PUT: update job
router.put("/update/:jobId", requireAuth("recruiter"), jobController.updateJob);

// DELETE: delete job
router.delete("/delete/:jobId", requireAuth("recruiter"), jobController.deleteJob);

// GET: all jobs
router.get("/all", jobController.getAllJobs);

// GET: job by ID
router.get("/:jobId", jobController.getJobById);

// GET: recruiter jobs
router.get("/recruiter/all", requireAuth("recruiter"), jobController.getRecruiterJobs);

// GET: applications for a job
router.get("/applications/:jobId", requireAuth("recruiter"), jobController.getApplications);

module.exports = router;
