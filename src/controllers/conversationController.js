const Conversation = require("../models/Conversation");

//Create conversation / chat
const createConversation = async (req, res) => {
  const { firstId, secondId } = req.body;

  try {
    const chat = await Conversation.findOne({
      members: { $all: [firstId, secondId] },
    });
    if (chat) return res.status(200).json(chat);

    const newChat = new Conversation({
      members: [firstId, secondId],
    });
    const response = await newChat.save();

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json(err);
  }
};

//get conv of a user / find user chat
const getConversationsByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const conversation = await Conversation.find({
      members: { $in: [userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
};

// get conv includes two userId find chat
const getConversationByMembers = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createConversation,
  getConversationsByUser,
  getConversationByMembers,
};
