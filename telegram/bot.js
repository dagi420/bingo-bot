const TelegramBot = require("node-telegram-bot-api");
const { User } = require("../models"); // Ensure the User model is correctly defined
const { getOpt } = require("../constants");
const { generateToken } = require("../utils/jwtUtil");
const { where } = require("sequelize");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const userStates = {};

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/register") {
    console.log("first");
    try {
      if (userStates[chatId] === "awaiting_deposit_amount") {
        delete userStates[chatId];
      }
      // Check if the user already exists
      const user = await User.findOne({
        where: { telegramId: chatId.toString() },
      });

      if (!user) {
        // Ask for the phone number if the user is not found
        bot.sendMessage(chatId, "Welcome! Please share your phone number:", {
          reply_markup: {
            keyboard: [
              [
                {
                  text: "Share phone number",
                  request_contact: true,
                },
              ],
            ],
            one_time_keyboard: true,
          },
        });
      } else {
        // Generate a JWT for the user using the secret key
        const token = generateToken({
          id: user.id,
          telegramId: chatId.toString(),
          username: msg.from.username,
        });
        bot.sendMessage(chatId, token, getOpt(token));
        // bot.sendMessage(chatId, "Welcome To Our Bot", getOpt(token));
      }
    } catch (error) {
      console.error("Error finding user:", error);
      bot.sendMessage(
        chatId,
        "An error occurred while processing your request."
      );
    }
  }
  if (userStates[chatId] === "awaiting_deposit_amount") {
    const depositAmount = parseFloat(text);

    // Validate the deposit amount
    if (isNaN(depositAmount) || depositAmount <= 0) {
      bot.sendMessage(chatId, "Please enter a valid deposit amount.");
    } else {
      // Update the user's wallet with the deposit amount
      const returnValue = await updateUserWallet(chatId, depositAmount);
      console.log({ returnValue });
      // Send a confirmation message
      bot.sendMessage(chatId, returnValue);

      // Reset the user's state
      delete userStates[chatId];
    }
  }
});

bot.onText(/\/deposit/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "How much would you like to deposit?");

  // Set the state to "awaiting deposit amount"
  userStates[chatId] = "awaiting_deposit_amount";
});

bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  if (data === "deposit") {
    bot.sendMessage(chatId, "How much would you like to deposit?");
    userStates[chatId] = "awaiting_deposit_amount";
  }
});

bot.on("contact", async (msg) => {
  const chatId = msg.chat.id;
  const phoneNumber = msg.contact.phone_number;

  try {
    const [user, created] = await User.findOrCreate({
      where: { telegramId: chatId.toString() },
      defaults: {
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
        phoneNumber,
      },
    });

    // Generate a JWT for the user using the secret key
    const token = generateToken({
      id: user.id,
      telegramId: chatId.toString(),
      username: msg.from.username,
    });

    if (created) {
      bot.sendMessage(chatId, token, getOpt(token));
    } else {
      bot.sendMessage(chatId, "You have already shared your phone number.");
    }
  } catch (error) {
    console.error("Error saving user:", error);
    bot.sendMessage(
      chatId,
      "An error occurred while saving your phone number."
    );
  }
});

async function updateUserWallet(userId, amount) {
  try {
    const user = await User.findOne({
      where: { telegramId: userId },
    });
    if (!user) {
      return "User not found 2";
    }
    const updatedWallet = user.wallet + amount;
    const [updated] = await User.update(
      { wallet: updatedWallet },
      { where: { telegramId: userId } } // Use telegramId here
    );

    if (updated === 0) {
      return "User update failed";
    }
    if (!updated) {
      return "User not found 3";
    }
    return `Your deposit of ${amount} has been added to your wallet.`;
  } catch (error) {
    console.error("Error updating user:", error);
    return "Internal Server Error";
  }
}

module.exports = bot;
