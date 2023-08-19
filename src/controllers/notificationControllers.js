const Notification = require("../models/Notification");

//Current  user is the receiver
const fetchNotifications = async (req, res) => {
  try {
    const currentUser = req.user; // Get the authenticated user's ID

    // Fetch all notifications where the current user is the receiver and the type is relevant
    const notifications = await Notification.find({
      receiver: currentUser._id,
      type: {
        $in: [
          "FRIEND_REQUEST_SENT",
          "FRIEND_REQUEST_ACCEPTED",
          "FRIEND_REQUEST_REJECTED",
        ],
      },
    })
      .populate("sender", "displayName image username")
      .populate("receiver", "displayName image username")
      .sort({ createdAt: -1 }); // Sort notifications by creation date in descending order

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//current is the  sender
// Fetch notifications for the current user as the sender
const fetchNotificationsSender = async (req, res) => {
  try {
    const currentUser = req.user; // Get the authenticated user's ID

    // Fetch all notifications where the current user is the sender
    const notifications = await Notification.find({
      sender: currentUser._id,
      type: {
        $in: [
          "FRIEND_REQUEST_SENT",
          "FRIEND_REQUEST_ACCEPTED",
          "FRIEND_REQUEST_REJECTED",
        ],
      },
    })
      .populate("sender", "displayName image username")
      .populate("receiver", "displayName image username")
      .sort({ createdAt: -1 }); // Sort notifications by creation date in descending order

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Notification dropdown controller

const notificationDropdown = async (req, res) => {
  try {
    const currentUser = req.user; // Get the authenticated user's ID

    // Fetch notifications where the current user is the receiver
    const receiverNotifications = await fetchNotifications(currentUser._id);

    // Fetch notifications where the current user is the sender
    const senderNotifications = await fetchNotificationsSender();

    // Combine and sort both sets of notifications based on createdAt
    const allNotifications = [
      ...receiverNotifications,
      ...senderNotifications,
    ].sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(allNotifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  fetchNotifications,
  fetchNotificationsSender,
};
