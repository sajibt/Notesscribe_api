const express = require("express");
const {
  getDashboard,
  addNewNote,
} = require("../controllers/dashboardControllers");
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

router.get("/", checkAuth, getDashboard);

router.post("/add", checkAuth, addNewNote);

module.exports = router;
