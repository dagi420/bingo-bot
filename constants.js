require("dotenv").config();

const getOpt = (token) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Play",
            web_app: { url: `${process.env.FRONT_END_URL}/?token=${token}` },
          },
        ],
        [
          {
            text: "Deposit",
            callback_data: "deposit",
          },
        ],
      ],
    },
  };
};

module.exports = { getOpt };