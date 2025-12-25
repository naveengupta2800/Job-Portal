const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const { uploadImage, uploadResume } = require("../middleware/uploadMiddleware"); 

const profileController = require("../controllers/profileController");

// Recruiter
router.get(
  "/recruiter",
  requireAuth("recruiter"),
  profileController.getProfile
);

router.put(
  "/recruiter",
  requireAuth("recruiter"),
  profileController.updateProfile
);

router.post(
  "/recruiter/image",
  requireAuth("recruiter"),
  uploadImage.single("profileImage"), 
  profileController.uploadProfileImage
);

// Jobseeker
router.get(
  "/jobseeker",
  requireAuth("jobseeker"),
  profileController.getProfile
);

router.put(
  "/jobseeker",
  requireAuth("jobseeker"),
  profileController.updateProfile
);

router.post(
  "/jobseeker/image",
  requireAuth("jobseeker"),
  uploadImage.single("profileImage"), 
  profileController.uploadProfileImage
);

router.post(
  "/jobseeker/resume",
  requireAuth("jobseeker"),
  uploadResume.single("resume"), 
  profileController.uploadResume
);
module.exports = router;


