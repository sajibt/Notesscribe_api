const express = require("express");
const router = express.Router();
const {
  createMessage,
  getMessages,
} = require("../controllers/messageController");
const checkAuth = require("../middlewares/checkAuth");

router.post("/", checkAuth, createMessage);
router.get("/:conversationId", checkAuth, getMessages);

module.exports = router;
