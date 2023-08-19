const User = require("../models/User");

// Block User
const blockUser = async (req, res) => {
    try {
        const userA = req.user; // User who wants to block the other user
        const userBId = req.params.userId; // User whom user A wants to block

        // Check if userBId is already in the blockedUsers list of userA
        if (!userA.blockedUsers.includes(userBId)) {
            userA.blockedUsers.push(userBId);
            await userA.save();
        }

        res.status(200).json({ message: "User blocked." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Unblock User

// Unblock User
const unblockUser = async (req, res) => {
    try {
        const userA = req.user; // User who wants to unblock the other user
        const userBId = req.params.userId; // User whom user A wants to unblock

        // Find user A and update the blockedUsers array to remove userBId
        const updatedUserA = await User.findOneAndUpdate(
            { _id: userA._id },
            { $pull: { blockedUsers: userBId } },
            { new: true },
        );

        if (!updatedUserA) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ message: "User unblocked." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Blocked Users

// Get Blocked Users
const getBlockedUsers = async (req, res) => {
    try {
        const user = req.user; // Current authenticated user
        const blockedUserIds = user.blockedUsers; // Get the array of blocked user IDs from the user object

        // Fetch details of blocked users based on their IDs, and select only the required fields (displayName and image)
        const blockedUsers = await User.find(
            { _id: { $in: blockedUserIds } },
            { displayName: 1, image: 1, username: 1 },
        );

        res.status(200).json(blockedUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    blockUser,
    unblockUser,
    getBlockedUsers,
};
