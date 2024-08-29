const { Game, SelectedCard, User, GameType } = require("../models");
const jwt = require("jsonwebtoken");

const getActiveGameUserDetail = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the active game where the user has selected a card
    const selectedCard = await SelectedCard.findOne({
      where: { userId },
      include: [
        {
          model: Game,
          where: { status: "active" },
        },
      ],
    });

    if (!selectedCard || !selectedCard.Game) {
      return res.status(200).json({
        game: null,
      });
    }

    const activeGame = selectedCard.Game;

    // Return the game and the selected card details
    return res.status(200).json({
      game: {
        id: activeGame.id,
        name: activeGame.name,
        status: activeGame.status,
        startTime: activeGame.startTime,
        endTime: activeGame.endTime,
      },
      card: {
        cardId: selectedCard.cardId,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPendingGame = async (req, res) => {
  try {
    // Find the latest pending game
    const pendingGame = await Game.findOne({
      where: { status: "pending" },
      order: [["createdAt", "DESC"]],
    });

    if (!pendingGame) {
      return res.status(404).json({
        message: "No pending game found",
      });
    }

    // Return the pending game details
    return res.status(200).json({
      id: pendingGame.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getGame = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the active game where the user has selected a card
    const selectedCard = await SelectedCard.findOne({
      where: { userId },
      include: [
        {
          model: Game,
          where: { status: "active" },
        },
      ],
    });
    if (selectedCard) {
      const activeGame = selectedCard.Game;

      // Return the game and the selected card details
      return res.status(200).json({
        game: {
          id: activeGame.id,
          name: activeGame.name,
          status: activeGame.status,
          startTime: activeGame.startTime,
          endTime: activeGame.endTime,
        },
        card: {
          cardId: selectedCard.cardId,
        },
      });
    }
    const gameType = req.query.gameType;

    const gameTypeFound = await GameType.findOne({
      where: { id: gameType },
    });
    if (!gameTypeFound) {
      return res.status(400).json({
        message: "gameType is required",
      });
    }
    const pendingGame = await Game.findOne({
      where: { status: "pending", gameTypeId: gameType },
      order: [["createdAt", "DESC"]],
    });

    if (!pendingGame) {
      return res.status(404).json({
        message: "No pending game found",
      });
    }

    // Return the pending game details
    return res.status(200).json({
      game: {
        id: pendingGame.id,
        status: pendingGame.status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const availableGames = async (req, res) => {
  try {
    const games = await GameType.findAll({
      where: { status: "active" },
    });
    if (!games) {
      return res.status(404).json({
        message: "No available games, Please comeback later,",
      });
    }
    return res.status(200).json({
      games,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getActiveGameUserDetail,
  getPendingGame,
  getGame,
  availableGames,
};
