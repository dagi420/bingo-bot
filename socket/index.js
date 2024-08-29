const socketIo = require("socket.io");
const {
  Game,
  SelectedCard,
  User,
  Card,
  GameType,
  sequelize,
} = require("../models"); // Ensure the path to models is correct
const { validateWinnings } = require("../utils/utils");

let io;
let cardSelections = {}; // Track card selections by game ID (room)
let drawnNumbers = {}; // Track all drawn numbers by game ID (room)
let currentDrawnNumbers = {}; // Track currently drawn numbers by game ID (room)
let lockedInCards = {}; // Track locked-in cards by game ID (room)
let amountToStart = 2;
let gameStarted = {}; // Track game started state by game ID (room)

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    const gameId = socket.handshake.query.gameId;

    if (!userId || userId === null || userId === "null" || !gameId) {
      console.error("User ID and Game ID must be provided");
      return;
    }

    socket.join(gameId);

    let game;
    if (!(gameId in gameStarted)) {
      game = await Game.findByPk(gameId);
    }
    // Initialize game data if not already initialized
    if (!lockedInCards[gameId]) lockedInCards[gameId] = [];
    if (!cardSelections[gameId]) cardSelections[gameId] = {};
    if (gameStarted[gameId] === undefined) gameStarted[gameId] = false;
    if (!drawnNumbers[gameId]) drawnNumbers[gameId] = [];
    if (!currentDrawnNumbers[gameId]) currentDrawnNumbers[gameId] = [];

    // for some reason game is not initalized in the memory - like the server restarting  or something
    if (game && !(gameId in gameStarted)) {
      if (game.status === "active") {
        gameStarted[gameId] = true;
        // if (!drawnNumbers[gameId]) {
        //   // emitRandomNumbers(gameId);
        //   console.log("first");
        // }
      }
      if (game.status === "pending") {
        gameStarted[gameId] = false;
      }
    }

    // initializing card selection for pending game and the users that have locked in a card
    if (game) {
      console.log({ game: game.dataValues });
      if (game.status === "pending") {
        gameStarted[gameId] = false;
        const selectedCardsBasedOnGame = await SelectedCard.findAll({
          where: { gameId },
        });
        cardSelections[gameId] = selectedCardsBasedOnGame.reduce(
          (acc, card) => {
            lockedInCards[gameId].push(card.cardId);
            acc[card.userId] = {
              cardId: +card.cardId,
              lockedIn: true, // Set to true based on your requirement, or false if needed
            };
            return acc;
          },
          {}
        );

        console.log({
          selectedCardsBasedOnGame: selectedCardsBasedOnGame.length,
          cardSelectddddions: cardSelections[gameId],
        });
      } else if (game.status === "active") {
        gameStarted[gameId] = true;
        cardSelections[gameId] = {};
        lockedInCards[gameId] = [];
        socket.emit("startGame", gameStarted[gameId]); // Inform the new connection of the game state.
      }
    }

    console.log({ cardSelections });
    // Send the current state of all selected cards to a newly connected client
    socket.emit("allSelectedCards", cardSelections[gameId]);
    socket.emit("startGame", gameStarted[gameId]); // Inform the new connection of the game state
    socket.emit("drawnNumbers", currentDrawnNumbers[gameId]); // Inform the new connection of the drawn numbers

    socket.on("selectCard", async (payload) => {
      const { cardId, lockedIn } = payload;
      console.log({ test: cardSelections[gameId] });
      if (!cardId) return;
      if (gameStarted[gameId] === true) {
        return;
      }

      // if card Selections is locked in, do not allow card selection with out unlocking
      if (cardSelections[gameId][userId]?.lockedIn) {
        if (
          cardId !== cardSelections[gameId][userId].cardId ||
          lockedIn === true
        ) {
          return;
        }

        // disabling unlocking of card
        // todo unlocking card might be a feature to add";
        return;
      }

      const previousCardId = cardSelections[gameId][userId];
      // Deselect the previous card if its not selected anywhere else

      if (
        previousCardId?.cardId &&
        !doesAnyUserHaveCardId(previousCardId.cardId, cardSelections[gameId])
      ) {
        io.to(gameId).emit("cardSelected", {
          cardId: previousCardId.cardId,
          isSelected: false,
          lockedIn: previousCardId.lockedIn,
        });
      }

      // Add card to lockedInCards if not already present
      if (lockedIn && !lockedInCards[gameId].includes(cardId)) {
        // Save the selected card to the database
        const user = await User.findOne({ where: { id: userId } });

        const game = await Game.findByPk(gameId, {
          include: [{ model: GameType, as: "gameType" }],
        });

        if (!game) {
          console.log("Game not found");
          return;
        }

        const deductionAmount = game.gameType.value;

        if (user.wallet < deductionAmount) {
          console.log("Insufficient funds");
          return;
        }

        await SelectedCard.create({
          cardId,
          userId: user.id,
          gameId: gameId,
        });
        await user.update({
          wallet: user.wallet - game.gameType.value,
        });
        lockedInCards[gameId].push(cardId);

        cardSelections[gameId][userId] = { ...payload, userId };
        io.to(gameId).emit("cardSelected", {
          cardId,
          isSelected: true,
          userId,
          lockedIn,
        });
      }

      // Update the card selection state
      if (!lockedIn) {
        cardSelections[gameId][userId] = { ...payload, userId };
        io.to(gameId).emit("cardSelected", {
          cardId,
          isSelected: true,
          userId,
          lockedIn,
        });
      }

      socket.emit("allSelectedCards", cardSelections[gameId]);

      // Check if we have enough locked-in cards to start the game
      console.log({
        gameStarted: gameStarted[gameId],
        lockedInCards: lockedInCards[gameId].length,
      });
      if (
        !gameStarted[gameId] &&
        lockedInCards[gameId].length >= amountToStart
      ) {
        // Update the current pending game status to 'active'
        const game = await Game.findByPk(gameId);
        if (game && game.status === "pending") {
          // Wrap in a transaction to ensure atomic update
          await sequelize.transaction(async (transaction) => {
            await game.update(
              { status: "active", startTime: new Date() },
              { transaction }
            );

            gameStarted[gameId] = true; // Set the flag to indicate the game has started

            io.to(gameId).emit("startGame", true); // Notify all clients in the room that the game has started

            // Delay emitting random numbers by 30 seconds
            setTimeout(() => {
              if (gameStarted[gameId]) {
                emitRandomNumbers(gameId);
              }
            }, 5000); // 30 seconds delay

            // Create the next pending game
            await Game.create(
              {
                name: `Next Game`,
                status: "pending",
                gameTypeId: game.gameTypeId,
                startTime: new Date(),
              },
              { transaction }
            );

            // Clear lockedInCards for the next game session
            cardSelections[gameId] = {};
            lockedInCards[gameId] = [];
          });
        }
      }
      console.log({ dave: cardSelections[gameId] });
    });

    socket.on("bingo", async (payload) => {
      const { cardId } = payload;
      if (!cardId) {
        console.log("No game or card ID");
        return;
      }
      const cardGot = await Card.findOne({
        where: { cardId: cardId },
      });
      if (!cardGot) {
        console.log("card not found");
        return;
      }

      let drawnNumbersDd = currentDrawnNumbers[gameId];

      const game = await Game.findOne({
        where: { id: gameId },
        include: [{ model: GameType, as: "gameType" }],
      });
      console.log({
        game: game.dataValues.drawnNumbers,
        card: cardGot.dataValues,
      });
      if (drawnNumbersDd.length === 0) {
        // todo think about this, people can say bingo without any number drawn
        drawnNumbersDd = game.dataValues.drawnNumbers;
      }
      const validWinning = validateWinnings(cardGot.dataValues, drawnNumbersDd);
      if (validWinning) {
        console.log("BinGOOO");
      }
      if (!validWinning) {
        console.log("Not a valid winning card");
        return;
      }
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        console.log("User not found");
        return;
      }

      // validate if the selectedCard is what is sent
      const selectedCard = await SelectedCard.findOne({
        where: {
          userId: user.id,
          gameId,
          cardId,
        },
      });
      console.log({
        cardSelected: selectedCard,
        userId: user.id,
        gameId,
        cardId,
      });
      if (!selectedCard) {
        console.log("no Selected card");
        return;
      }

      if (!game) {
        console.log("Game not found");
        return;
      }

      // count the numbers of cards selected in the game

      const selectedCards = await SelectedCard.count({
        where: {
          gameId,
        },
      });

      user.update({
        wallet: user.wallet + selectedCards * game.gameType.value,
      });
      // Update game to completed

      await game.update({
        userId: user.id,
        status: "completed",
        endTime: new Date(),
      });

      // Remove the game from the gameStarted state
      if (gameId in gameStarted) {
        delete gameStarted[gameId];
      }

      io.to(gameId).emit("winner", {
        message: "Bingo",
        user: user.firstName || user.username || user.lastName,
      });
    });

    socket.on("disconnect", () => {
      if (
        cardSelections[gameId][userId] &&
        !cardSelections[gameId][userId].lockedIn
      ) {
        io.to(gameId).emit("cardSelected", {
          cardId: cardSelections[gameId][userId].cardId,
          isSelected: false,
          userId,
        });
        delete cardSelections[gameId][userId];
      }
    });
  });
};

const emitRandomNumbers = async (gameId) => {
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
  const shuffledNumbers = numbers.sort(() => Math.random() - 0.5);
  drawnNumbers[gameId] = shuffledNumbers;

  const game = await Game.findByPk(gameId);
  await game.update({ drawnNumbers: shuffledNumbers });

  currentDrawnNumbers[gameId] = []; // Initialize the array to store currently drawn numbers

  let index = 0;
  const interval = setInterval(() => {
    if (index >= shuffledNumbers.length) {
      clearInterval(interval);
      return;
    }
    if (!gameStarted[gameId]) {
      clearInterval(interval);
      return;
    }

    currentDrawnNumbers[gameId].push(shuffledNumbers[index]);
    io.to(gameId).emit("numberDrawn", currentDrawnNumbers[gameId]);
    index++;
  }, 5000); // Emit a number every second (adjust as needed)
};

const doesAnyUserHaveCardId = (cardId, cardSelections) => {
  let foundCount = 0;

  for (const selection of Object.values(cardSelections)) {
    if (selection.cardId === cardId) {
      foundCount++;
      if (foundCount > 1) {
        return true; // Found more than one user with the same cardId, so return true
      }
    }
  }

  return false; // Only one user (or none) has this cardId
};

module.exports = { initializeSocket };
