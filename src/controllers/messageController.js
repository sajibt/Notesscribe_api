const Message = require("../models/Message");

//create message
const createMessage = async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

// const getMessages = async (req, res) => {
//   try {
//     const messages = await Message.find({
//       conversationId: req.params.conversationId,
//     });
//
//     // Fetch user data for each sender in messages
//     const messagesWithUsers = await Promise.all(
//       messages.map(async (message) => {
//         const senderUser = await User.findById(message.sender); // Assuming you have a User model
//         return {
//           ...message.toObject(),
//           sender: senderUser, // Replace sender ID with sender user data
//         };
//       }),
//     );
//
//     res.status(200).json(messagesWithUsers);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// };

module.exports = {
  createMessage,
  getMessages,
};
