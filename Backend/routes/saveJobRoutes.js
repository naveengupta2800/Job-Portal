const router = require("express").Router();
const saveJobController = require("../controllers/saveJobController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/save/:jobId", requireAuth("jobseeker"), saveJobController.saveJob);
router.post("/unsave/:jobId", requireAuth("jobseeker"), saveJobController.unsaveJob);
router.get("/saved", requireAuth("jobseeker"), saveJobController.getSavedJobs);

module.exports = router;
