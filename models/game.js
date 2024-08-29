"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    static associate(models) {
      // Define association here
      Game.hasMany(models.SelectedCard, { foreignKey: "gameId" });
      Game.belongsTo(models.User, { foreignKey: "userId" });
      Game.belongsTo(models.GameType, {
        foreignKey: "gameTypeId",
        as: "gameType",
      });
    }
  }

  Game.init(
    {
      status: {
        type: DataTypes.ENUM("pending", "active", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      drawnNumbers: {
        type: DataTypes.JSON, // Use JSON data type
        allowNull: true,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gameTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "GameTypes",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Game",
      tableName: "Games",
      timestamps: true,
    }
  );

  return Game;
};
