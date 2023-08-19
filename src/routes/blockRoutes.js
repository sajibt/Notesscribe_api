const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const {
    blockUser,
    unblockUser,
    getBlockedUsers,
} = require("../controllers/blockControllers");

const router = express.Router();

// Routes for blocking and unblocking users
router.post("/block/:userId", checkAuth, blockUser);
router.post("/unblock/:userId", checkAuth, unblockUser);
router.get("/blockedUser", checkAuth, getBlockedUsers);

module.exports = router;
