const express = require("express");
const {
  subscribeUser,
  unsubscribeUser,
  getUserSubscriptions,
  getUserFollowers,
  getUserSubscriptionsAndFollowers,
} = require("../controllers/subscriptionsController");
const checkAuth = require("../middlewares/checkAuth");
const router = express.Router();

// Subscribe to a user
router.post("/subscribe/:userId", checkAuth, subscribeUser);

// Unsubscribe from a user
router.post("/unsubscribe/:userId", checkAuth, unsubscribeUser);

// Get user subscriptions
router.get("/:userId/subscriptions", checkAuth, getUserSubscriptions);

//get followers of  curretn user
// router.get("/:userId/followers", checkAuth, getUserFollowers);
router.get("/:userId/followers", checkAuth, getUserSubscriptionsAndFollowers);

module.exports = router;
