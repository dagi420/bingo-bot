"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SelectedCard extends Model {
    static associate(models) {
      SelectedCard.belongsTo(models.Game, { foreignKey: "gameId" });
      SelectedCard.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  SelectedCard.init(
    {
      cardId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: DataTypes.STRING,
      gameId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "SelectedCard",
    }
  );
  return SelectedCard;
};
