const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const router = express.Router();
const {
    getUser,
    searchNotesByTitle,
    getAllNotes,
    editNote,
    updateNote,
    deleteNote,
    singleNote,
    getUserNotes,
    addNewNote,
    addToFavorites,
    getNotersNotes,
    getFriendsNotes,
} = require("../controllers/notesControllers");
const { ensureAuth } = require("../middlewares/authMiddlewares");

// router.get("/", checkAuth, getLoginPage);

router.get("/getuser", checkAuth, getUser);

router.post("/add", checkAuth, addNewNote);

router.get("/", checkAuth, getAllNotes);

// router.get("/:id", checkAuth, singleNote);

router.get("/edit/:id", checkAuth, editNote);

router.put("/:id", checkAuth, updateNote);

router.delete("/:id", checkAuth, deleteNote);

router.get("/user/:userId", checkAuth, getUserNotes);

// GET notes/search/:query
// router.get("/search/:query", checkAuth, searchNotesByTitle);

// GET notes/noters
router.get("/noters/:userId", checkAuth, getNotersNotes);
router.get("/friends", checkAuth, getFriendsNotes);

router.post("/:noteId/favorite", checkAuth, addToFavorites);

module.exports = router;
