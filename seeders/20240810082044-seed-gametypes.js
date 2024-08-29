"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "GameTypes",
      [
        {
          name: "10",
          description: "The stake is 10",
          value: 10,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "20",
          description: "The stake is 10",
          value: 20,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "50",
          description: "The stake is 10",
          value: 50,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "100",
          description: "The stake is 10",
          value: 100,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("GameTypes", null, {});
  },
};
