const User = require("../models/User");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

// Get user profile by ID
const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const userProfile = await User.findById(userId)
      .select("-password") // Exclude password field from the result
      .exec();

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resizeImage = async (inputImagePath, outputImagePath) => {
  const roundedCorners = Buffer.from(
    '<svg><rect x="0" y="0" width="200" height="200" rx="50" ry="50"/></svg>',
  );
  try {
    await sharp(inputImagePath)
      .resize(300, 300) // Set your desired dimensions here
      .composite([
        {
          input: roundedCorners,
          blend: "dest-in",
        },
      ])
      .toFile(outputImagePath); // Save the resized image to a new path
  } catch (error) {
    throw error;
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const { displayName, firstName, lastName, username } = req.body;
  const userId = req.user._id; // User ID from authenticated user
  let imageUrl;

  console.log(req.body, "req body has");
  console.log(req.file, "req files have ?");

  try {
    // Handle file upload using req.file
    const imagePath = req.file ? req.file.path : undefined;
    console.log(imagePath, "insider image path ? ");

    // Save the image file and get the image URL
    // const imageUrl = imagePath
    //     ? `/uploads/profileimage/${path.basename(imagePath)}`
    //     : undefined;
    //
    // const imageUrl = imagePath
    //   ? `http://localhost:5000/uploads/profileimage/${path.basename(imagePath)}`
    //   : undefined;

    //Resize the iamge
    if (imagePath) {
      // Resize the image using the external function
      const resizedImagePath = `${imagePath}_ms`; // New output path
      await resizeImage(imagePath, resizedImagePath);
      fs.unlinkSync(imagePath);

      // Update imageUrl with the resized image URL
      imageUrl = `http://localhost:5000/uploads/profileimage/${path.basename(
        resizedImagePath,
      )}`;
    } else {
      // No image uploaded, imageUrl will be undefined
      imageUrl = undefined;
    }
    // Check if the updated username is already taken
    const existingUsername = await User.findOne({ username });

    if (
      existingUsername &&
      existingUsername._id.toString() !== userId.toString()
    ) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    // Find and update the user's profile
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { displayName, firstName, lastName, username, image: imageUrl },
      { new: true }, // Return the updated user profile
    ).select("-password");
    console.log(updatedProfile, "updated Profile???");

    if (!updatedProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json({ user: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//check username is exist
const usernameAvailability = async (req, res) => {
  const { username } = req.query;

  try {
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(200).json({ available: false });
    } else {
      return res.status(200).json({ available: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  usernameAvailability,
};
