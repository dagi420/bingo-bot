"use strict";
require("dotenv").config();
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const gameTypes = await queryInterface.sequelize.query(
      process.env.DB_CONNECTION === "mysql"
        ? "SELECT id FROM `GameTypes`;"
        : 'SELECT id FROM "GameTypes";'
    );
    const gameTypesRows = gameTypes[0];

    await queryInterface.bulkInsert(
      "Games",
      [
        {
          status: "pending",
          gameTypeId: gameTypesRows[0].id,
          startTime: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          status: "pending",
          gameTypeId: gameTypesRows[1].id,
          startTime: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          status: "pending",
          gameTypeId: gameTypesRows[2].id,
          startTime: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          status: "pending",
          gameTypeId: gameTypesRows[3].id,
          startTime: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Games", null, {});
  },
};
