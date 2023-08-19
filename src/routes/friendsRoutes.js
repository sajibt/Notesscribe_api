const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  blockFriend,
  unblockFriend,
  cancelFriendRequest,
  rejectFriendRequest,
  fetchFriends,
} = require("../controllers/friendsControllers");

const {
  fetchNotifications,
  fetchNotificationsSender,
} = require("../controllers/notificationControllers");

// Fetch the friend list for a specific user (GET) - /friends/:userId
router.get("/:userId", checkAuth, fetchFriends);

// Send Friend Request (POST) - /friends/sendRequest/:userId
router.post("/sendRequest/:userId", checkAuth, sendFriendRequest);

// Accept Friend Request (POST) - /friends/acceptRequest/:userId
router.post("/acceptRequest/:userId", checkAuth, acceptFriendRequest);

// Remove Friend (DELETE) - /friends/removeFriend/:userId
router.delete("/removeFriend/:userId", checkAuth, removeFriend);

// Cancel Friend Request (DELETE) - /friends/cancelRequest/:userId
router.delete("/cancelRequest/:userId", checkAuth, cancelFriendRequest);

// Reject Friend Request (DELETE) - /friends/rejectRequest/:userId
router.delete("/rejectRequest/:userId", checkAuth, rejectFriendRequest);

// Fetch notifications for a specific user(sender) (other than the authenticated user) (GET) - /friends/notifications/:userId
router.get("/notifications/:userId", checkAuth, fetchNotifications);

// Fetch notifications for the authenticated user as the sender (GET) - /friends/notifications/sender
router.get("/notifications/sender", checkAuth, fetchNotificationsSender);

// Block Friend (POST) - /friends/blockFriend/:userId
// router.post("/blockFriend/:userId", checkAuth, blockFriend);

// Unblock Friend (POST) - /friends/unblockFriend/:userId
// router.post("/unblockFriend/:userId", checkAuth, unblockFriend);

module.exports = router;
