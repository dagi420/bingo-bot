const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Adjust the path to your User model
require("dotenv").config();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database
    const user = await User.findByPk(verified.id); // Assuming the token contains user ID

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach the user object to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token Expired" });
    }
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = authenticateToken;
