const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

// format createdAt as relative time just time,one day ago
const formatCreatedAt = (createdAt) => {
  return dayjs(createdAt).fromNow();
};

// Truncate the given text to the specified maxLength
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  } else {
    return text.substring(0, maxLength) + "...";
  }
};

//  handle error responses
const appError = (res, status, message) => {
  return res.status(status).json({ error: message });
};

//  handle success responses
const appSuccess = (res, status, message, data = null) => {
  if (data) {
    return res.status(status).json({ message, data });
  } else {
    return res.status(status).json({ message });
  }
};

module.exports = { formatCreatedAt, truncateText, appError, appSuccess };
