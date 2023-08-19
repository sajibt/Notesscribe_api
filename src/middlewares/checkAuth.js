const jwt = require("jsonwebtoken");
const User = require("../models/User");
const getUserFromToken = require("../utils/getUserFromToken");

const checkAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  // Allow anonymous access for the signup route
  // if (req.url === "/auth/signup" && req.method === "POST") {
  //   return next();
  // }

  // if (authorization && authorization.startsWith("Bearer")) {
  if (authorization && authorization.startsWith("Bearer")) {
    // JWT token exists in the Authorization header then split the array first one is bearer and 2nd one is token
    const token = authorization.split(" ")[1];

    try {
      const user = await getUserFromToken(token);

      if (!user) {
        throw new Error("User not found");
      }

      req.user = user;
      return next();
    } catch (error) {
      // Invalid token, fall back to session-based authentication
      console.log(error, "error is here");
    }
  }
  // Check for session-based authentication
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  } else {
    res.status(401).json({ error: "User is not authorized" });
  }
};

module.exports = checkAuth;
