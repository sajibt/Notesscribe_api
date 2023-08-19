const Note = require("../models/Note");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Send Friend Request

const sendFriendRequest = async (req, res) => {
  try {
    const currentUser = req.user; // User who is sending the friend request -->senderUser
    const receiverId = req.params.userId; // User to whom the friend request is sent

    if (currentUser === receiverId) {
      return res
        .status(400)
        .json({ error: "You cannot send a friend request to yourself" });
    }

    // Check if the friend request notification already exists
    const existingNotification = await Notification.findOne({
      sender: currentUser._id,
      receiver: receiverId,
      type: "FRIEND_REQUEST_SENT",
    });

    // if (existingNotification) {
    //   return res
    //     .status(400)
    //     .json({ error: "Friend request notification already sent" });
    // }

    // Find the recever user and add the current user's ID to their friendRequests array
    await User.findByIdAndUpdate(
      receiverId,
      { $addToSet: { friendReqRcv: currentUser._id } },
      { new: true },
    );

    // Add the recever user's ID to the current user's friendRequestsSent array
    const currentUserUpdated = await User.findByIdAndUpdate(
      currentUser._id,
      { $addToSet: { friendReqSent: receiverId } },
      { new: true },
    );

    // After adding friendReqSent to the receiver and receiver's ID to friendReqRcv,
    // create a notification for the receiver
    const notification = new Notification({
      sender: currentUser._id,
      receiver: receiverId,
      type: "FRIEND_REQUEST_SENT",
      notificationFor: "receiver",
    });
    await notification.save();

    res
      .status(200)
      .json({ message: "Friend request sent.", user: currentUserUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const currentUser = req.user; // User who is accepting the friend request
    const senderUserId = req.params.userId; // User who sent the friend request

    // Find the sender user and add the current user's ID to their friends array
    const senderUser = await User.findByIdAndUpdate(
      senderUserId,
      {
        $addToSet: { friends: currentUser._id },
        $pull: { friendReqSent: currentUser._id },
      },
      { new: true },
    );

    // Check if the current user has already accepted the friend request from the sender
    const isAlreadyAccepted = currentUser.friends.includes(senderUserId);

    if (!isAlreadyAccepted) {
      // Update the current user's friends array and remove sender user from friendReqRcv array
      const currentUserAfterAccepting = await User.findByIdAndUpdate(
        currentUser._id,
        {
          $addToSet: { friends: senderUserId },
          $pull: { friendReqRcv: senderUserId },
        },
        { new: true },
      );

      // Automatically add each other to subscriptions (follow each other)
      await User.findByIdAndUpdate(
        currentUser._id,
        { $addToSet: { subscriptions: senderUserId } },
        { new: true },
      );

      await User.findByIdAndUpdate(
        senderUserId,
        { $addToSet: { subscriptions: currentUser._id } },
        { new: true },
      );

      // Add them also in followers list
      await User.findByIdAndUpdate(
        currentUser._id,
        { $addToSet: { followers: senderUserId } },
        { new: true },
      );

      await User.findByIdAndUpdate(
        senderUserId,
        { $addToSet: { followers: currentUser._id } },
        { new: true },
      );

      // Create a notification for the sender indicating the friend request was accepted
      const notificationForSender = new Notification({
        sender: currentUser._id,
        receiver: senderUserId,
        type: "FRIEND_REQUEST_ACCEPTED",
        message: `You accepted ${senderUser.displayName}'s friend request.`,
        notificationFor: "sender",
      });

      await notificationForSender.save();

      // Create a notification for the receiver indicating the friend request was accepted
      const notificationForReceiver = new Notification({
        sender: senderUserId,
        receiver: currentUser._id,
        type: "FRIEND_REQUEST_ACCEPTED",
        message: `${currentUser.displayName} accepted your friend request.`,
        notificationFor: "receiver",
      });

      await notificationForReceiver.save();
      res.status(200).json({
        message: "Friend request accepted.",
        user: currentUserAfterAccepting,
      });
    } else {
      res.status(400).json({ error: "Friend request already accepted" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove Friend
const removeFriend = async (req, res) => {
  try {
    const currentUser = req.user; // User who wants to remove the friend
    const friendToRemoveId = req.params.userId; // User whom user wants to remove from friends

    // Find the friend to be removed and remove current user's ID from their friends array
    const friendToRemove = await User.findByIdAndUpdate(
      friendToRemoveId,
      { $pull: { friends: currentUser._id } },
      { new: true },
    );

    // Remove friend to be removed's ID from current user's friends array
    const currentUserUpdated = await User.findByIdAndUpdate(
      currentUser._id,
      { $pull: { friends: friendToRemoveId } },
      { new: true },
    );

    // Remove the subscription (follow) relationship between the users
    await User.findByIdAndUpdate(
      friendToRemoveId,
      { $pull: { subscriptions: currentUser._id } },
      { new: true },
    );

    await User.findByIdAndUpdate(
      currentUser._id,
      { $pull: { subscriptions: friendToRemoveId } },
      { new: true },
    );

    // Remove each other from followers list
    await User.findByIdAndUpdate(
      friendToRemoveId,
      { $pull: { followers: currentUser._id } },
      { new: true },
    );

    await User.findByIdAndUpdate(
      currentUser._id,
      { $pull: { followers: friendToRemoveId } },
      { new: true },
    );

    res
      .status(200)
      .json({ message: "Friend removed.", user: currentUserUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cancel Friend Request
const cancelFriendRequest = async (req, res) => {
  try {
    const currentUser = req.user; // User who is canceling the friend request
    const receiverUserId = req.params.userId; // User to whom the friend request was sent

    // Find and remove the friend request notification from the receiver's notifications
    await Notification.deleteOne({
      sender: currentUser._id,
      receiver: receiverUserId,
      type: "FRIEND_REQUEST_SENT",
    });

    // Find the receiver user and remove the current user's ID from their friendReqRcv array
    await User.findByIdAndUpdate(
      receiverUserId,
      { $pull: { friendReqRcv: currentUser._id } },
      { new: true },
    );

    // Remove the receiver user's ID from the current user's friendReqSent array
    const currentUserUpdated = await User.findByIdAndUpdate(
      currentUser._id,
      { $pull: { friendReqSent: receiverUserId } },
      { new: true },
    );

    res
      .status(200)
      .json({ message: "Friend request canceled.", user: currentUserUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject Friend Request
const rejectFriendRequest = async (req, res) => {
  try {
    const currentUser = req.user; // User who is rejecting the friend request
    const senderUserId = req.params.userId; // User who sent the friend request

    // Find the sender user and remove the current user's ID from their friendReqRcv array
    await User.findByIdAndUpdate(senderUserId, {
      $pull: { friendReqSent: currentUser._id },
    });

    // Find the current user and remove the sender user's ID from their friendReqRcv array
    const currentUserUpdated = await User.findByIdAndUpdate(
      currentUser._id,
      { $pull: { friendReqRcv: senderUserId } },
      { new: true }, // Return the updated user data
    );

    const dpn = await User.findById(senderUserId);

    // Create a notification for the sender indicating the friend request was rejected
    const notificationForSender = new Notification({
      sender: currentUser._id,
      receiver: senderUserId,
      type: "FRIEND_REQUEST_REJECTED",
      message: `${currentUser.displayName} rejected your friend request.`,
      notificationFor: "sender",
    });

    await notificationForSender.save();

    // Create a notification for the receiver indicating the friend request was rejected
    const notificationForReceiver = new Notification({
      sender: senderUserId,
      receiver: currentUser._id,
      type: "FRIEND_REQUEST_REJECTED",
      message: `You rejected the friend request from ${dpn.displayName}.`,
      notificationFor: "receiver",
    });

    await notificationForReceiver.save();

    res
      .status(200)
      .json({ message: "Friend request rejected.", user: currentUserUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch the friend list for a specific user

// Fetch the friend list for a specific user
const fetchFriends = async (req, res) => {
  try {
    const userId = req.params.userId; // Get the user's ID from the request
    const user = await User.findById(userId).populate(
      "friends",
      "displayName image username",
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  rejectFriendRequest,
  cancelFriendRequest,
  fetchFriends,
};
