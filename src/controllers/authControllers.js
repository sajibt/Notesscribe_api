const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateDefaultAvatar } = require("../utils/avatarUtils");
const sendPasswordResetEmail = require("../utils/sendPasswordResetEmail");
const { createToken } = require("../utils/token");

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const checkAuth = require("../middlewares/checkAuth");
const getUserFromToken = require("../utils/getUserFromToken");

// Signup controller
const signupUser = async (req, res) => {
  const { email, password, name, username } = req.body;

  try {
    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Check if the username already exists in the database
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: "Username has already been taken" });
    }

    // Salt the password (same password will get different hash value)
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);

    // Check if the password and salt variables have truthy values
    if (!password || !salt) {
      return res.status(400).json({ error: "Invalid password or salt" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a default avatar URL based on the user's first name
    const defaultAvatar = generateDefaultAvatar(name);
    const avatarUrl = req.protocol + "://" + req.get("host") + defaultAvatar;
    console.log(avatarUrl, "user?");

    // Create a new user
    const newUser = new User({
      googleId: null,
      displayName: name,
      email,
      password: hashedPassword,
      username,
      firstName: null,
      lastName: null,
      image: avatarUrl,
      createdAt: Date.now(),
      favorites: [],
      subscriptions: [],
      followers: [],
      friends: [],
      friendReqSent: [],
      friendReqRcv: [],
      blockedUsers: [],
    });

    await newUser.save();

    // Create a JWT token with user id and key
    // const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET_KEY);
    const expiresIn = "1d";

    const token = createToken(newUser._id, expiresIn);

    // Get the user information from the JWT token using the getUserFromToken function
    const user = await getUserFromToken(token);

    // Send the token and user information in the response
    res.json({
      token,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Signin controller

const signinUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    // Handle JWT login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get the expiration time based on whether "Remember Me" is checked
    const expiresIn = rememberMe ? "7d" : "1d";
    console.log(email, rememberMe);

    // Create a token
    const token = createToken(user._id, expiresIn);

    // Create a separate variable for essential user information
    const essentialUserData = {
      _id: user._id,
      displayName: user.displayName,
      email: user.email,
      username: user.username,
      image: user.image,
      favorites: user.favorites,
      // subscriptions: user.subscriptions,
    };

    // Send the token and essential user information in the response
    res.json({
      message: "JWT signin successful",
      token,
      user: essentialUserData,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to signin user" });
  }
};

//GEt  Current  Logged in User

const getGoogleUser = async (user) => {
  const followers = await User.find({ subscriptions: user._id }).select(
    "_id displayName image",
  );
  return {
    _id: user._id,
    googleId: user.googleId,
    displayName: user.displayName,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.image,
    favorites: user.favorites,
    subscriptions: user.subscriptions,
    followers: followers,
    friends: user.friends,
    friendReqSent: user.friendReqSent,
    friendReqRcv: user.friendReqRcv,
    blockedUsers: user.blockedUsers,
  };
};

// // Helper function to get essential user data for normal email login user
const getEmailUser = async (user) => {
  const followers = await User.find({ subscriptions: user._id }).select(
    "_id displayName image",
  );
  return {
    _id: user._id,
    displayName: user.displayName,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.image,
    favorites: user.favorites,
    subscriptions: user.subscriptions,
    followers: followers,
    friends: user.friends,
    friendReqSent: user.friendReqSent,
    friendReqRcv: user.friendReqRcv,
    blockedUsers: user.blockedUsers,
  };
};

// Main getUser function current logged in user
// const getCurrentUser = async (req, res) => {
//   try {
//     if (req.user.googleId) {
//       // Handle Google login user
//       const googleUser = getGoogleUser(req.user);
//       return res.status(200).json({ user: googleUser });
//     } else {
//       // Handle normal email login user
//       const emailUser = getEmailUser(req.user);
//       return res.status(200).json({ user: emailUser });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// };

// Main getUser function for the current logged-in user

const getCurrentUser = async (req, res, next) => {
  console.log(req.user, "main req header");

  try {
    if (req.user.googleId) {
      // Handle Google login user
      const googleUser = await getGoogleUser(req.user);
      console.log(googleUser, "googleid");
      return res.status(200).json({ user: googleUser });
    } else {
      // Handle JWT login user
      const jwtUser = await getEmailUser(req.user);
      console.log(jwtUser, "jwt user");
      return res.status(200).json({ user: jwtUser });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// const getCurrentUser = async (req, res, next) => {
//   try {
//     if (req.user) {
//       // If the request has a user object, it means the user is authenticated.
//       // You can handle the authenticated user here, whether it's a signup user or logged-in user.
//       // For example, if the user is authenticated with JWT, you can use the req.user object directly.
//       // If you have additional information in the req.user object for signup users, you can handle it accordingly.
//
//       // For now, let's simply return the user data directly in the response.
//       console.log(req.user, "hello user? ?");
//       return res.status(200).json({ user: req.user });
//     } else {
//       // If there is no user object in the request, the user is not authenticated.
//       // You can handle unauthenticated users here if needed.
//
//       return res.status(401).json({ error: "User is not authenticated" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// };

// const getCurrentUser = async (req, res) => {
//   try {
//     // Create a new object without the password field
//     const curUser = {
//       _id: req.user._id,
//       displayName: req.user.displayName,
//       email: req.user.email,
//       username: req.user.username,
//       firstName: req.user.firstName,
//       lastName: req.user.lastName,
//       image: req.user.image,
//       favorites: req.user.favorites,
//       googleId: req.user.googleId,
//       // Add other user properties that you want to include
//     };
//     //
//     console.log(curUser, "thisi si fucking current user?");
//     return res.status(200).json({ user: curUser });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Server Error" });
//   }
// };

// Controller for user logout
// const logoutUser = async (req, res, next) => {
//   // PWith passport middleware we have logout object in req.logout
//   // res.status(200).json({ success: true });
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//
//     res.redirect("http://localhost:3000/login");
//   });
// };

// const logoutUser = async (req, res, next) => {
//   // Check if the user is using Google authentication
//   if (req.user?.googleId) {
//     // For Google users, redirect to the Google logout URL
//     return req.logout(function (err) {
//       if (err) {
//         return next(err);
//       }
//       return res.redirect("http://localhost:3000/login");
//     });
//   } else {
//     res.redirect("http://localhost:3000/login");
//   }
// };
//

const logoutUser = async (req, res, next) => {
  // Check if the user is using Google authentication
  if (req.user?.googleId !== null) {
    // For Google users, perform the logout action using req.logout
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      // Redirect to the client login page after successful logout
      res.redirect("http://localhost:3000/login");
    });
  } else {
    // For JWT users and other types of authentication, no need to use req.logout
    // Redirect to the client login page after successful logout
    res.redirect("http://localhost:3000/login");
  }
};
//Controller for forgot password

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next({
        status: 404,
        message: "User not found",
      });
    }

    // Generate a random token and save it in the database
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Compose and send the reset password email
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please click the following link to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    `;

    try {
      await sendPasswordResetEmail({
        to: email,
        subject: "Password Reset Request",
        text: message,
      });

      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return next({ status: 500, message: "Error sending email" });
    }
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Internal server error" });
  }
};
//Controller for reset user password

const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired resetToken" });
    }

    // Update the password in the database
    const newPassword = req.body.newPassword;

    // Salt the password (same password will get different hash value)
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);

    // Check if the password and salt variables have truthy values
    if (!newPassword || !salt) {
      return res.status(400).json({ error: "Invalid password or salt" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  signupUser,
  signinUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
