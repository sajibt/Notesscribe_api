const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "FRIEND_REQUEST_SENT",
        "FRIEND_REQUEST_ACCEPTED",
        "FRIEND_REQUEST_REJECTED",
      ],

      required: true,
    },

    message: {
      type: String,
    },
    notificationFor: {
      type: String,
      enum: ["sender", "receiver"],
      required: true,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
