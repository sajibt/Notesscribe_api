const Note = require("../models/Note");
const { truncateText } = require("../utils/utils");

const getDashboard = async (req, res) => {
  try {
    const maxLength = 100; // set the maximum length for the truncated text

    const { firstName } = req.user;
    const notes = await Note.find({ user: req.user.id }).sort({
      createdAt: "desc",
    });

    const formattedNotes = notes.map((note) => ({
      ...note.toObject(),
      body: truncateText(note.body, maxLength),
    }));

    res.status(200).json({ notes: formattedNotes, firstName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// addNotes controllers for dashboard
const addNewNote = async (req, res) => {
  try {
    req.body.user = req.user.id; // Set the user field to the logged-in user's ID
    const newNote = await Note.create(req.body);
    res.status(200).json({ note: newNote });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getDashboard, addNewNote };
