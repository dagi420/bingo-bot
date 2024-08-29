const TelegramBot = require('node-telegram-bot-api');
const token = '7217503396:AAG35tU_YyqCBBITotWrXfihp-OXfJwxj34'; // Replace with your bot token
const User = require('./models/User'); // Adjust the path as needed
const { v4: uuidv4 } = require('uuid'); // Add this line at the top of your file

const bot = new TelegramBot(token, { polling: true });
const io = require('socket.io-client');
const socket = io('http://localhost:5000');
const connectDB = require('./config/db'); // Ensure this path is correct
require("dotenv").config();

// Connect to the database
connectDB();

// Use dynamic import for node-fetch
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;

  const userStates = {};

  // Start Command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the Bingo game bot! Use /register to Register and start playing.');
  });

  // Registration Command
  bot.onText(/\/register/, async (msg) => {
    const chatId = msg.chat.id;

    // Check if the user is already registered


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

  // Handle Contact Sharing
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

  // Handle Accept/Cancel Button Clicks
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'accept') {
      try {
        const phoneNumber = userStates[chatId].phoneNumber;
        const username = callbackQuery.from.username;

        // Check again if the user is already registered
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
          bot.sendMessage(chatId, 'You are already registered.');
        } else {
          // Generate a unique token
          const token = uuidv4();

          // Save the new user to the database
          const newUser = new User({
            phoneNumber,
            username,
            token,
          });
          await newUser.save();

          bot.sendMessage(chatId, `Registration successful! Your unique token is: ${token}`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Play",
                    web_app: { url: `${process.env.FRONT_END_URL}/?token=${token}` },
                  },
              ],
              ],
            }
          });
        }
      } catch (err) {
        console.error('Error during registration:', err); // Log the error to the console
        bot.sendMessage(chatId, 'An error occurred while processing your registration. Please try again later.');
      }

      // Clear user state
      delete userStates[chatId];

    } else if (data === 'cancel') {
      bot.sendMessage(chatId, 'Registration canceled.');
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
          'Authorization': `Bearer YOUR_JWT_TOKEN`
        }
      });

      const result = await response.json();
      const gameUrl = result.gameUrl;

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
          'Authorization': `Bearer YOUR_JWT_TOKEN`
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
          'Authorization': `Bearer YOUR_JWT_TOKEN`
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
