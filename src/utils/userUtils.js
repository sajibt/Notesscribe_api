const User = require("../models/User");

// Function to create a new user from the Google profile
const createUserFromGoogleProfile = async (profile) => {
  const {
    id: googleId,
    displayName,
    emails,
    name: { givenName, familyName },
    photos,
  } = profile;

  const email = (emails && emails[0]?.value) || null;
  const image = (photos && photos[0]?.value) || null;
  const username = displayName.toLowerCase().replace(/\s+/g, "-");

  try {
    // Check if the email already exists in your database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return existingUser; // Return the existing user if the email already exists
    }

    // Create a new user in the database
    const newUser = new User({
      googleId,
      displayName,
      email,
      username,
      firstName: givenName,
      lastName: familyName,
      image,
      createdAt: Date.now(),
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { createUserFromGoogleProfile };
