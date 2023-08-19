const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../src/models/User");
const { createUserFromGoogleProfile } = require("../src/utils/userUtils");

// Passport configuration
module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile, "passport - Profile");
        try {
          // Check if the user already exists in your database
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // If the user doesn't exist, create a new user using the utility function
            user = await createUserFromGoogleProfile(profile);
          } // Return the user object
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    //saved to session req.session.passport.user={id}
    // done(null, user);
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      //user object attaches to the req.user
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
