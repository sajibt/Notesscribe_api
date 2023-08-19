const express = require("express");
const router = express.Router();
const {
  createConversation,
  getConversationsByUser,
  getConversationByMembers,
} = require("../controllers/conversationController");
const checkAuth = require("../middlewares/checkAuth");

router.post("/", checkAuth, createConversation);
router.get("/:userId", checkAuth, getConversationsByUser);
router.get("/find/:firstId/:secondId", checkAuth, getConversationByMembers);

module.exports = router;
