"use strict";

const user = require("../models/user");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Games", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM("pending", "active", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users", // Ensure Users table exists before running this migration
          key: "id",
        },
        allowNull: true, // Ensures userId is not null
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Or SET NULL based on your requirements
      },
      drawnNumbers: {
        type: Sequelize.JSON, // Use JSON to store arrays
        allowNull: true,
      },
      gameTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "GameTypes", // Ensure GameTypes table exists before running this migration
          key: "id",
        },
        allowNull: false, // Ensures gameTypeId is not null
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Or SET NULL based on your requirements
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Games");
    if (queryInterface.sequelize.options.dialect === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_Games_status";'
      );
    }
  },
};
