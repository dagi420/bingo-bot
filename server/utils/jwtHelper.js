// utils/jwtHelper.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';  // Ensure you have a secret key

function generateToken(user) {
  const payload = {
    id: user.id,  // User's unique identifier
    telegramId: user.telegramId,  // Telegram user ID
    username: user.username  // Telegram username
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });  // Token expires in 24 hours
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
