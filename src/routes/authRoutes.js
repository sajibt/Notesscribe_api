const express = require("express");
const passport = require("passport");
const {
  getCurrentUser,
  logoutUser,
  signinUser,
  signupUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");
const checkAuth = require("../middlewares/checkAuth");
const router = express.Router();

// // Auth login route
// router.get("/login", (req, res) => {
//     // Render your login page or redirect to it
// });

// Google OAuth authentication route
// passport authenticate take sstrategy nand scope nprofile it will return profile data
//@route GET /auth/google
// Google OAuth authentication route with email scope
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google OAuth callback route
// @route GET /auth/google/callback
router.get(
  "/google/callback",
  //if it fails we redirect to login and if success  redirected to /dashboard
  passport.authenticate("google", { failureRedirect: "/login" }),
  // passport.authenticate("google",{ failureRedirect: 'http://localhost:3000', session: true }),
  (req, res) => {
    // Successful authentication, redirect to the dashboard or desired page
    res.redirect("http://localhost:3000/");
  },
);

// //@route GET /auth/logout logout  user route
// router.get("/logout", (req, res, next) => {
//   // PWith passport middleware we have logout object in req.logout
//   // res.status(200).json({ success: true });
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//
//     res.redirect("http://localhost:3000/login");
//   });
// });

// @POST /auth/signup -->   singup   user
router.post("/signup", signupUser);

// POST /auth/signin  --> signin user
router.post("/signin", signinUser);

// @GET auth/logout  --> Logout the loggedin user
router.get("/logout", logoutUser);

// @GET auth/logout  --> Logout the loggedin user
router.get("/logout", logoutUser);

//@POST auth/
router.get("/logout", logoutUser);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password/:resetToken", resetPassword);

//@GET /auth/user --> Get the currently logged-in user
router.get("/user", checkAuth, getCurrentUser);

module.exports = router;
