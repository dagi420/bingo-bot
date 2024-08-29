const express = require("express");
const userRoutes = require("./usersRoutes");
const authRoutes = require("./authRoutes");
const gameRoutes = require("./gameRoutes");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use("/auth", authRoutes);
router.use(authMiddleware);
router.use("/users", userRoutes);
router.use("/game", gameRoutes);

module.exports = router;
