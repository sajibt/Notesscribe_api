const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  } else {
    res.redirect("http://localhost:5000/");
  }

  // User is not authenticated, redirect them to the login page or send an error response
  // res.redirect("/");
  // res.redirect("http://localhost:5000/dashboard");
};

const ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // User is not authenticated, proceed to the next middleware or route handler
    return next();
  } else {
    // User is authenticated, redirect them to the home page or send an error response
    res.redirect("http://localhost:5000/dashboard");
  }
};

module.exports = {
  ensureAuth,
  ensureGuest,
};
