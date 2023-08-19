const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUserFromToken = async (token) => {
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(userId).select("-password");
    console.log(user, "user from token");
    return user;
  } catch (error) {
    return null;
  }
};

module.exports = getUserFromToken;
