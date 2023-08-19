const Note = require("../models/Note");
const User = require("../models/User");

// const getLoginPage = async (req, res) => {
//   console.log(req.user, "req.user from root");
//   res.send("Login Page for guest");
// };

//get the current logged in user
// const getUser = (req, res) => {
//   res.send(req.user);
//
//
// };

// Helper function to get essential user data for Google login user
const getGoogleUser = async (user) => {
  // Find followers of the current user
  const followers = await User.find({ subscriptions: currentUser._id }).select(
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
    favoritesCount: user.favorites.length,
    subscriptions: user.subscriptions,
    followers: followers,
  };
};

// Helper function to get essential user data for normal email login user
const getEmailUser = async (user) => {
  const followers = await User.find({ subscriptions: currentUser._id }).select(
    "_id displayName image",
  );
  // Get the following list of the current user
  const following = currentUser.subscriptions;
  return {
    _id: user._id,
    displayName: user.displayName,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.image,
    favorites: user.favorites,
    favoritesCount: user.favorites.length,
    subscriptions: user.subscriptions,
    followers: followers,
  };
};

// Main getUser function current logged in user
const getUser = async (req, res) => {
  try {
    if (req.user.googleId) {
      // Handle Google login user
      const googleUser = await getGoogleUser(req.user);
      return res.status(200).json(googleUser);
    } else {
      // Handle normal email login user
      const emailUser = await getEmailUser(req.user);
      return res.status(200).json(emailUser);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// shared addNotes controllers for dashboard/add and notes/add
// const addNewNote = async (req, res) => {
//   try {
//     req.body.user = req.user.id; // Set the user field to the logged-in user's ID
//     const newNote = await Note.create(req.body);
//
//     // Check if the note status is "friends"
//     if (newNote.status === "friends") {
//       // If the status is "friends," find the user's friends and update the note's visibility
//       const user = await User.findById(req.user.id);
//       const userFriends = user.friends || [];
//       newNote.visibility = userFriends;
//       await newNote.save();
//     }
//
//     res.status(200).json({ note: newNote });
//   } catch (err) {
//     res.status(500).json({ message: "Server Error while add friends" });
//   }
// };

const addNewNote = async (req, res) => {
  try {
    req.body.user = req.user.id; // Set the user field to the logged-in user's ID
    const newNote = await Note.create(req.body);
    res.status(200).json({ note: newNote });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

//Get all notes
// const getAllNotes = async (req, res) => {
//   try {
//     const stories = await Note.find({ status: "public" })
//       .populate("user")
//       .sort({ createdAt: "desc" });
//
//     res.status(200).json({ stories });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

//Get all notes with favorites count

//Get all notes with favorites count and sort by createdAt in descending order

getAllNotes = async (req, res) => {
  try {
    const currentUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const notesPromise = Note.find({ status: "public" })
      .populate("user", "-password +favorites")
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCountPromise = Note.countDocuments({ status: "public" });

    const [notes, totalCount] = await Promise.all([
      notesPromise,
      totalCountPromise,
    ]);

    // Filter out notes from users who have blocked the viewer
    const filteredNotes = notes.filter((note) => {
      // Check if the note's user is in the blockedUsers list of the current user
      return !currentUser.blockedUsers.includes(note.user._id.toString());
    });

    const myNote = filteredNotes.map((note) => {
      return {
        _id: note._id,
        title: note.title,
        body: note.body,
        status: note.status,
        user: note.user,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,

        favorites: note.favorites,
        favoritesCount: note.favorites.length, // Count the number of favorites for each note
      };
    });

    res.status(200).json({ notes: myNote, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//followers aka Noters

const getNotersNotes = async (req, res) => {
  try {
    const currentUser = req.user; // Assuming you have authenticated the user

    console.log(currentUser, "user? noters ");

    // Get the list of user IDs for the current user's followers
    const followers = currentUser.followers.map((follower) => follower._id);

    // Get the list of user IDs for the users whom the current user is following
    const following = currentUser.subscriptions.map(
      (subscription) => subscription._id,
    );

    console.log(following, followers);

    // Include the user's ID, followers' IDs, and the users they are following in the noters list
    // only see the notes the people who you are following and the poeple who have followed you
    const noters = [currentUser._id, ...following];

    // Fetch notes with status set to "noters" and where the user ID matches the noters list
    const notes = await Note.find({
      status: "noters",
      user: { $in: noters },
    }).populate("user");

    console.log(notes, "noters?");

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get friends Notes
const getFriendsNotes = async (req, res) => {
  try {
    const user = req.user; // Assuming you have authenticated the user

    // Get the user's friends
    const userFriends = user.friends || [];

    // Include the current user's ID in the friends list
    userFriends.push(user._id);

    // Fetch notes with status set to "friends" and where the user ID matches the friends list
    const notes = await Note.find({
      status: "friends",
      user: { $in: userFriends },
    }).populate("user");

    console.log(notes, user, "notes??? db");

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// show Single notes routes
// const singleNote = async (req, res) => {
//     try {
//         let story = await Note.findById(req.params.id).populate("user").lean();
//
//         if (!story) {
//             return res.render("error/404");
//         }
//
//         if (story.user._id != req.user.id && story.status == "private") {
//             res.render("error/404");
//         } else {
//             res.render("stories/show", {
//                 story,
//             });
//         }
//     } catch (err) {
//         console.error(err);
//         res.render("error/404");
//     }
// };

//edit notes page single user
const editNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
    });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to edit this note" });
    }

    res.status(200).json({ note });
    console.log(" i m called editnote? ");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//update notes
const updateNote = async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to edit this note" });
    }

    const { title, body, status } = req.body;

    note.title = title;
    note.body = body;
    note.status = status;

    await note.save();

    res.status(200).json({ message: "Note updated successfully", note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//delete the note
const deleteNote = async (req, res) => {
  try {
    let note = await Note.findById(req.params.id).lean();

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.user != req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this note" });
    } else {
      await Note.findByIdAndRemove(req.params.id);
      return res.status(200).json({ message: "Note deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//get user profile  all notes
const getUserNotes = async (req, res) => {
  try {
    const userId = req.params.userId;

    const currentUser = req.user;

    // Check if the user is blocked by the current user
    if (currentUser.blockedUsers.includes(userId.toString())) {
      return res.status(404).json({ error: "User not found." });
    }

    const notes = await Note.find({
      user: userId,
      status: "public",
    }).populate("user");

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

//Search notes
// const searchNotesByTitle = async (req, res) => {
//     try {
//         const stories = await Note.find({
//             title: new RegExp(req.query.query, "i"),
//             status: "public",
//         })
//             .populate("user")
//             .sort({ createdAt: "desc" })
//             .lean();
//         res.render("stories/index", { stories });
//     } catch (err) {
//         console.log(err);
//         res.render("error/404");
//     }
// };

// Add a note to user's favorites list

const addToFavorites = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.user._id; // Assuming you have authenticated the user

    // Find the user and the note
    const user = await User.findById(userId);
    const note = await Note.findById(noteId);
    console.log(userId, user, "userid user");

    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }

    // Check if the user has already favorited the note
    const isAlreadyFavorited = note.favorites.includes(userId);

    if (isAlreadyFavorited) {
      // Remove the user's ID from favorites
      note.favorites = note.favorites.filter(
        (_id) => _id.toString() !== userId.toString(),
      );
      // Remove the note from the user's favorites array
      user.favorites = user.favorites.filter(
        (_id) => _id.toString() !== noteId.toString(),
      );
    } else {
      // Add the user's ID to favorites
      note.favorites.push(userId);

      // Add the note to the user's favorites array
      user.favorites.push(noteId);
    }

    // Update the favorite count
    note.favoritesCount = note.favorites.length;

    // Save the updated note and user
    await note.save();
    await user.save();

    console.log(note, "noteeeee");

    res.json({ message: "Note updated in favorites.", note });
  } catch (err) {
    res.status(500).json({ error: "Unable to update favorites." });
  }
};

module.exports = {
  getUser,
  addNewNote,
  getAllNotes,
  // singleNote,
  editNote,
  updateNote,
  deleteNote,
  getUserNotes,
  // searchNotesByTitle,
  addToFavorites,
  getNotersNotes,
  getFriendsNotes,
};
