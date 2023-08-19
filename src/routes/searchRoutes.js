const express = require("express");
const { searchNotes } = require("../controllers/searchControllers");
const checkAuth = require("../middlewares/checkAuth");
const router = express.Router();

// Search notes
router.get("/", searchNotes);

module.exports = router;
