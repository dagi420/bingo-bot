const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');
const connectDB = require('./config/db');
const fetch = require('node-fetch'); // Import fetch
const socket = require('socket.io-client')('http://localhost:5000'); // Socket connection

// Connect to the database
connectDB();

const token = '6371705475:AAHk8-26BOmdM9WNHZMdIQtfYM5vXoGecnU'; // Replace with your actual token
const bot = new TelegramBot(token, { polling: true });

// Initialize user states for registration process
const userStates = {};

// Start Command - Introduction Message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to the Bingo game bot! Use /register to register and start playing.');
});

// Registration Command - Initiate Registration Process
bot.onText(/\/register/, (msg) => {
  const chatId = msg.chat.id;

  // Initialize user state for registration
  userStates[chatId] = { step: 'awaiting_contact' };

  bot.sendMessage(chatId, 'Please share your contact information for registration.', {
    reply_markup: {
      keyboard: [
        [{ text: 'Share Contact', request_contact: true }],
        [{ text: 'Cancel' }]
      ],
      one_time_keyboard: true
    }
  });
});

// Handle Contact Sharing - Process Contact Information
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const contact = msg.contact;

  if (!userStates[chatId] || userStates[chatId].step !== 'awaiting_contact') return;

  userStates[chatId].phoneNumber = contact.phone_number;
  userStates[chatId].step = 'awaiting_confirmation';

  bot.sendMessage(chatId, `You shared the phone number: ${contact.phone_number}. Do you want to proceed with this phone number?`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Accept', callback_data: 'accept' }],
        [{ text: 'Cancel', callback_data: 'cancel' }]
      ]
    }
  });
});

// Handle Accept/Cancel Button Clicks - Complete Registration or Cancel
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (!userStates[chatId]) {
    bot.sendMessage(chatId, 'No registration process found.');
    return;
  }

  if (data === 'accept') {
    try {
      const userState = userStates[chatId];
      const phoneNumber = userState.phoneNumber;
      const username = callbackQuery.from.username;

      let user = await User.findOne({ phoneNumber });
      if (user) {
        bot.sendMessage(chatId, 'You are already registered.');
      } else {
        const token = uuidv4();
        user = new User({ phoneNumber, username, token });
        await user.save();
      }

      // Send the play button after successful registration
      const playUrl = `http://localhost:3000/game/${username}`; // Adjust the URL for production
      bot.sendMessage(chatId, `Registration successful! Click [here](${playUrl}) to start playing!`, { parse_mode: 'Markdown' });

      // Clear user state
      delete userStates[chatId];

    } catch (err) {
      bot.sendMessage(chatId, 'An error occurred while processing your registration. Please try again later.');
      console.error('Error during registration:', err);
    }
  } else if (data === 'cancel') {
    bot.sendMessage(chatId, 'Registration canceled.');
    delete userStates[chatId];
  } else if (data === 'join_game') {
    try {
      bot.sendMessage(chatId, 'Finding a game for you...');
      const response = await fetch('http://localhost:5000/api/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_JWT_TOKEN`
        },
        body: JSON.stringify({ userId: chatId })
      });

      const result = await response.json();
      if (result.success) {
        bot.sendMessage(chatId, `You've been added to a game! The game will start shortly.`);
      } else {
        bot.sendMessage(chatId, `Failed to join a game: ${result.message}`);
      }
    } catch (err) {
      bot.sendMessage(chatId, 'Error joining the game. Please try again later.');
    }
  } else if (data === 'start_new_game') {
    try {
      bot.sendMessage(chatId, 'Starting a new game...');
      const response = await fetch('http://localhost:5000/api/games/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_JWT_TOKEN`
        }
      });

      const result = await response.json();
      if (result.success) {
        const playUrl = `http://localhost:3000/game/${callbackQuery.from.username}`; // Adjust the URL for production
        bot.sendMessage(chatId, `New game started! Click [here](${playUrl}) to join the mini-app and start playing.`, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, `Failed to start a new game: ${result.message}`);
      }
    } catch (err) {
      bot.sendMessage(chatId, 'Failed to start the game.');
    }
  }
});

// Check Balance Command - Retrieve User Balance
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch('http://localhost:5000/api/users/balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_JWT_TOKEN`
      }
    });

    const result = await response.json();
    bot.sendMessage(chatId, `Your balance is: ${result.balance}`);
  } catch (err) {
    bot.sendMessage(chatId, 'Failed to retrieve your balance. Please try again later.');
    console.error('Error retrieving balance:', err);
  }
});

// Deposit Money Command - Deposit Money to User Account
bot.onText(/\/deposit (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const amount = parseInt(match[1], 10);

  if (isNaN(amount) || amount <= 0) {
    bot.sendMessage(chatId, 'Please enter a valid amount to deposit.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/users/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_JWT_TOKEN`
      },
      body: JSON.stringify({ amount })
    });

    const result = await response.json();
    if (result.success) {
      bot.sendMessage(chatId, `Successfully deposited ${amount}. Your new balance is: ${result.balance}`);
    } else {
      bot.sendMessage(chatId, `Failed to deposit money: ${result.message}`);
    }
  } catch (err) {
    bot.sendMessage(chatId, 'Failed to deposit money. Please try again later.');
    console.error('Error during deposit:', err);
  }
});
