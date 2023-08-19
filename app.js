const express = require("express");
const connectDB = require("./database/connection");
const dotenv = require("dotenv");
const morgan = require("morgan");
const notesRoutes = require("./src/routes/notesRoutes");
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
const subscriptionRoutes = require("./src/routes/subscriptions");
const blockRoutes = require("./src/routes/blockRoutes");
const friendsRoutes = require("./src/routes/friendsRoutes");
const userProfileRoutes = require("./src/routes/profileRoutes");
const conversationRoutes = require("./src/routes/conversationRoutes");
const messagesRoutes = require("./src/routes/messageRoutes");

const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");

const http = require("http");
const socketIO = require("socket.io");
const app = express();

//Load config
dotenv.config({ path: "./config/config.env" });

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = socketIO(server);

// Connect to MongoDB
connectDB();

//Middleware
app.use(express.json());
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5000"],
//     credentials: true,
//   }),
// );

//passport config
require("./config/passport-setup")(passport); // Initialize Passport.js configuration

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Initialize Passport and set up express-session middleware
app.use(
  session({
    secret: "143669",
    resave: false,
    saveUninitialized: false, //don't create a session until something is stored
    store: new MongoStore({ mongoUrl: process.env.mongoURI }),
    //       cookie: {
    //   maxAge: 3600000, // 1 hour (in milliseconds)
    //   httpOnly: true,
    //   path: "/",
    // },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/notes", notesRoutes); // All notes-related routes
app.use("/dashboard", dashboardRoutes); // All dashboard-related routes
app.use("/search", searchRoutes); // for search routes
app.use("/auth", authRoutes);
//subscriptions routes
// app.use(checkAuth);
app.use("/subscriptions", subscriptionRoutes);
app.use("/friends", friendsRoutes);
app.use("/blocks", blockRoutes);
app.use("/user", userProfileRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messagesRoutes);

const PORT = process.env.PORT || 4000;

//for logging run morgan only in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Socket.IO handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle chat events
  socket.on("send_message", async ({ senderId, receiverId, message }) => {
    try {
      // Check if sender and receiver are friends
      const sender = await User.findById(senderId);
      if (!sender.friends.includes(receiverId)) {
        console.log("You can only chat with friends");
        return;
      }

      // Send the message to the receiver
      socket.to(receiverId).emit("receive_message", { senderId, message });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
