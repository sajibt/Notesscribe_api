const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
  usernameAvailability,
  getAllUsers,
} = require("../controllers/profileControllers");
const path = require("path"); // Import the path module
const multer = require("multer");

const checkAuth = require("../middlewares/checkAuth");
const router = express.Router();

// Set up multer for file uploads
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, "uploads/profileimage");
//     },
//     filename: function(req, file, cb) {
//         cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
//     },
// });

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, path.join(__dirname, "uploads/profileimage"));
//     },
//     filename: function(req, file, cb) {
//         cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
//     },
// });

// const upload = multer({ storage });

// const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//         // Handle file type filtering if needed
//         // Call cb with an error if the file is not acceptable
//         cb(null, true);
//     },
//     onError: (err, next) => {
//         console.error("Multer Error:", err);
//         next(err);
//     },
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profileimage");
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Create an instance of multer with the defined storage engine
const upload = multer({ storage });

// Get user profile by ID
router.get("/profile/:userId", checkAuth, getUserProfile);
router.get("/allUsers", checkAuth, getAllUsers);

// Update user profile
router.patch(
  "/profile/update",
  checkAuth,
  upload.single("image"),
  updateUserProfile,
);

//check username availability
router.get("/username-check", checkAuth, usernameAvailability);

module.exports = router;
