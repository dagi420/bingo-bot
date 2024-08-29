"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GameType extends Model {
    static associate(models) {
      GameType.hasMany(models.Game, {
        foreignKey: "gameTypeId",
        as: "games",
      });
    }
  }
  GameType.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "GameType",
    }
  );
  return GameType;
};
