const User = require("../models/User");
const { appError, appSuccess } = require("../utils/utils");

// Subscribe to a user
const subscribeUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  try {
    const user = await User.findById(currentUserId);
    if (!user) {
      return appError(res, 404, "User not found!");
    }

    console.log(user, "user");
    const userToSubscribe = await User.findById(userId);
    if (!userToSubscribe) {
      return appError(res, 404, "User to subscribe not found");
    }

    if (user._id.equals(userToSubscribe._id)) {
      return appError(res, 400, "Cannot subscribe to yourself");
    }

    // check if already subscribed to that user
    if (user.subscriptions.includes(userToSubscribe._id)) {
      return appError(res, 400, "Already subscribed");
    }

    // push to the usertosubs array to the follwing list of current user
    user.subscriptions.push(userToSubscribe._id);
    await user.save();

    // Add the current user to the userToSubscribe's followers
    userToSubscribe.followers.push(currentUserId);
    await userToSubscribe.save();

    // // Populate the entire user object with subscriptions
    const updatedUser = await User.findById(currentUserId)
      .populate("subscriptions", "-password")
      .populate("followers", "-password");

    console.log(updatedUser, "follow");
    // Return the updated user object
    return appSuccess(res, 200, "Subscribed successfully", updatedUser);
  } catch (err) {
    return appError(res, 500, "Internal server error");
  }
};

// Unsubscribe from a user
const unsubscribeUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  try {
    const user = await User.findById(currentUserId);
    if (!user) {
      return appError(res, 404, "User not found");
    }

    const userToUnsubscribe = await User.findById(userId);
    if (!userToUnsubscribe) {
      return appError(res, 404, "User to unsubscribe not found");
    }

    if (user._id.equals(userToUnsubscribe._id)) {
      return appError(res, 400, "Cannot unsubscribe from yourself");
    }

    if (!user.subscriptions.includes(userToUnsubscribe._id)) {
      return appError(res, 400, "Not subscribed to the user");
    }

    // // Remove the current user's userId from the followers array of the userToUnsubscribe
    // userToUnsubscribe.followers = userToUnsubscribe.followers.filter(
    //   (followerId) => followerId !== currentUserId,
    // );
    // await userToUnsubscribe.save();

    // Remove the current user's userId from the followers array of the userToUnsubscribe
    userToUnsubscribe.followers = userToUnsubscribe.followers.filter(
      (followerId) => followerId.toString() !== currentUserId.toString(),
    );
    await userToUnsubscribe.save();

    user.subscriptions = user.subscriptions.filter(
      (subscribedUser) => !subscribedUser.equals(userToUnsubscribe._id),
    );
    await user.save();

    // // Populate the entire user object with subscriptions
    const updatedUser = await User.findById(currentUserId)
      .populate("subscriptions", "-password")
      .populate("followers", "-password");

    //
    // console.log(updatedUser, "fuck usuuuu");
    console.log(updatedUser, "sunfollow");

    // Return the updated user object
    return appSuccess(res, 200, "Unsubscribed successfully", updatedUser);
  } catch (err) {
    return appError(res, 500, "Internal server error");
  }
};

const getUserSubscriptions = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate(
      "subscriptions",
      "-password",
    ); //  populate subscriptions but select only displayName and id

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // // Return the entire user object
    res.json({ subscriptions: user.subscriptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get followers of a user
const getUserFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("followers", "-password");
    if (!user) {
      return appError(res, 404, "User not found");
    }

    // Return the followers list
    return appSuccess(
      res,
      200,
      "User followers fetched successfully",
      user.followers,
    );
  } catch (err) {
    return appError(res, 500, "Internal server error");
  }
};

// Get both subscriptions (following) and followers of a user
const getUserSubscriptionsAndFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .populate("subscriptions", "-password")
      .populate("followers", "-password");

    if (!user) {
      return appError(res, 404, "User not found");
    }

    return appSuccess(
      res,
      200,
      "User subscriptions and followers fetched successfully",
      {
        subscriptions: user.subscriptions,
        followers: user.followers,
      },
    );
  } catch (err) {
    return appError(res, 500, "Internal server error");
  }
};

module.exports = {
  subscribeUser,
  unsubscribeUser,
  getUserSubscriptions,
  getUserFollowers,
  getUserSubscriptionsAndFollowers,
};
