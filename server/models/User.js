// models/User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  wallet: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);

