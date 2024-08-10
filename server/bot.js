const TelegramBot = require('node-telegram-bot-api');
const token = '6371705475:AAHk8-26BOmdM9WNHZMdIQtfYM5vXoGecnU'; // Replace with your bot token

const bot = new TelegramBot(token, { polling: true });
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

// Use dynamic import for node-fetch
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;

  socket.on('bingoCalled', (data) => {
    console.log('Bingo called:', data);
    // Optionally send a message to users via Telegram
  });

  bot.onText(/\/bingo/, (msg) => {
    const chatId = msg.chat.id;
    socket.emit('bingoCalled', { gameId: 'exampleGameId', userId: chatId });
  });

  // Commands and interactions
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the Bingo game bot! Use /register to Register and start playing.');
  });

  // Example command to join a game
  bot.onText(/\/join/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      // Example: Call your backend API to join the game
      const response = await fetch('http://localhost:5000/api/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_JWT_TOKEN`
        },
        body: JSON.stringify({ gameId: 'exampleGameId' }) // Replace with actual game ID
      });

      const result = await response.json();
      bot.sendMessage(chatId, `Joined game: ${result.gameId}`);
    } catch (err) {
      bot.sendMessage(chatId, 'Failed to join the game.');
    }
  });

  // Handle other commands and interactions similarly
  // State management object
  const userStates = {};

  // Registration Command
  bot.onText(/\/register/, (msg) => {
    const chatId = msg.chat.id;

    // Initialize user state
    userStates[chatId] = { step: 'awaiting_phone' };

    bot.sendMessage(chatId, 'Please provide your phone number:');
  });

  // Handle incoming messages based on user state
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // If user is not in registration flow, ignore
    if (!userStates[chatId]) return;

    const userState = userStates[chatId];

    if (userState.step === 'awaiting_phone') {
      // Validate phone number (basic validation)
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(text)) {
        bot.sendMessage(chatId, 'Invalid phone number format. Please provide a valid phone number (e.g., +1234567890):');
        return;
      }

      userState.phoneNumber = text;
      userState.step = 'awaiting_username';
      bot.sendMessage(chatId, 'Thank you! Now, please provide your desired username:');
    } else if (userState.step === 'awaiting_username') {
      // Validate username (basic validation)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(text)) {
        bot.sendMessage(chatId, 'Invalid username format. Please provide a username (3-20 characters, letters, numbers, and underscores only):');
        return;
      }

      userState.username = text;

      // Proceed to register the user
      try {
        const response = await fetch('http://localhost:5000/api/users/register', { // Replace with your backend API URL
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: userState.phoneNumber, username: userState.username }),
        });

        if (response.ok) {
          const result = await response.json();
          bot.sendMessage(chatId, `Registration successful! Your unique token is: ${result.token}`);
        } else {
          const error = await response.json();
          bot.sendMessage(chatId, `Registration failed: ${error.message}`);
        }
      } catch (err) {
        bot.sendMessage(chatId, 'An error occurred while processing your registration. Please try again later.');
      }

      // Clear user state
      delete userStates[chatId];
    }
  });
  // Start Game Command
  bot.onText(/\/startgame/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const response = await fetch('http://localhost:5000/api/games/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_JWT_TOKEN` // Replace with actual JWT token
        }
      });

      const result = await response.json();
      const gameUrl = result.gameUrl; // URL to your mini-app

      bot.sendMessage(chatId, `Game started! Click [here](${gameUrl}) to join the mini-app and start playing.`, { parse_mode: 'Markdown' });
    } catch (err) {
      bot.sendMessage(chatId, 'Failed to start the game.');
    }
  });

  // Check Balance Command
  bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_JWT_TOKEN` // Replace with actual JWT token
        }
      });

      const result = await response.json();
      bot.sendMessage(chatId, `Your balance is: ${result.balance}`);
    } catch (err) {
      bot.sendMessage(chatId, 'Failed to retrieve balance.');
    }
  });

  // Deposit Money Command
  bot.onText(/\/deposit (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const amount = match[1];
    
    try {
      const response = await fetch('http://localhost:5000/api/users/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_JWT_TOKEN` // Replace with actual JWT token
        },
        body: JSON.stringify({ amount })
      });

      const result = await response.json();
      bot.sendMessage(chatId, `Deposited ${amount}. Your new balance is: ${result.balance}`);
    } catch (err) {
      bot.sendMessage(chatId, 'Failed to deposit money.');
    }
  });
})();
