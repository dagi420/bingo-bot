const express = require("express");
const {
  getActiveGameUserDetail,
  getPendingGame,
  getGame,
  availableGames,
} = require("../controllers/gameController");

const router = express.Router();
router.get("/", getActiveGameUserDetail);
router.get("/pending", getPendingGame);
router.get("/get-game", getGame);
router.get("/available-games", availableGames);

module.exports = router;
