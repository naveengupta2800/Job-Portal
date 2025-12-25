const multer = require("multer");
const path = require("path");

// IMAGE UPLOAD
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const valid =
    allowed.test(file.mimetype) &&
    allowed.test(path.extname(file.originalname).toLowerCase());
  cb(valid ? null : new Error("Only images allowed"), valid);
};

const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter });

// RESUME UPLOAD
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const resumeFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const valid =
    allowed.test(file.mimetype) ||
    allowed.test(path.extname(file.originalname).toLowerCase());
  cb(valid ? null : new Error("Only PDF/DOC/DOCX allowed"), valid);
};

const uploadResume = multer({ storage: resumeStorage, fileFilter: resumeFilter });

module.exports = { uploadImage, uploadResume };
