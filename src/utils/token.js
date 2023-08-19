const jwt = require("jsonwebtoken");

//inside token we pass 3 arguments 1. payload, 2. secret string 3. expiresdatee
const createToken = (userId, expiresIn) => {
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ userId }, secretKey, { expiresIn });

    return token;
};

module.exports = { createToken };
