const router = require("express").Router();
const applyController = require("../controllers/applyController");
const requireAuth = require("../middleware/authMiddleware");

// Jobseeker applies
router.post("/:jobId", requireAuth("jobseeker"), applyController.applyJob);

// Jobseeker applications
router.get("/me", requireAuth("jobseeker"), applyController.myApplications);

// Jobseeker withdraw
router.delete("/:id", requireAuth("jobseeker"), applyController.withdrawApplication);

// Recruiter - view applicants for a job
router.get(
  "/job/:jobId",
  requireAuth("recruiter"),
  applyController.getApplicationsForJob
);

// Recruiter - update application status
router.patch(
  "/:id/status",
  requireAuth("recruiter"),
  applyController.updateApplicationStatus
);

// ✅ Recruiter Dashboard Summary (IMPORTANT)
router.get(
  "/recruiter/dashboard-summary",
  requireAuth("recruiter"),
  applyController.getRecruiterDashboardSummary
);

module.exports = router;
