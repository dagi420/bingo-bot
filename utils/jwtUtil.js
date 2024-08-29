const jwt = require("jsonwebtoken");

// Secret key for signing JWTs. Ensure this is kept secure.
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key";

// Function to generate a JWT
function generateToken(user) {
  const payload = {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
  };

  // const options = {
  //   expiresIn: "1h", // Token expiration time
  // };

  // return jwt.sign(payload, jwtSecret, options);
  return jwt.sign(payload, jwtSecret);
}

// Function to verify a JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null; // Token verification failed
  }
}

module.exports = { generateToken, verifyToken };
