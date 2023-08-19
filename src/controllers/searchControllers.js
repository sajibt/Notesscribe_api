const Note = require("../models/Note");

const searchNotes = async (req, res) => {
    const { query } = req.query;

    try {
        // Perform text search on 'title' and 'body' fields of notes
        const searchResults = await Note.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } },
        )
            .sort({ score: { $meta: "textScore" } }) // Sort by relevance score
            .populate("user", "-password"); // Populate the 'user' field with user data excluding the password

        res.json(searchResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    searchNotes,
};
