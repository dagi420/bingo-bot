const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  if (!req.body?.name || !req.body?.email || !req.body?.password) {
    return res.status(400).json({ message: req.body });
  }
  const { name, email, password } = req.body;
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  if (!req.body?.email || !req.body?.password) {
    return res.status(400).json({ message: req.body });
  }
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    // Create and sign a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const tokenVerify = async (req, res) => {
  if (!req.body?.token) {
    return res.status(400).json({ message: "No token found" });
  }
  const { token } = req.body;
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.status(400).json({ message: "Invalid token" });
    const user = await User.findOne({
      where: { id: verified.id },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error verifying token:", error);
    // invalid token response
    res.status(404).json({ message: "Something went wrong" });
  }
};

module.exports = { register, login, tokenVerify };
