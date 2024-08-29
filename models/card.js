"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    static associate(models) {
      // Define associations here
    }
  }
  Card.init(
    {
      cardId: DataTypes.INTEGER,
      B1: DataTypes.INTEGER,
      B2: DataTypes.INTEGER,
      B3: DataTypes.INTEGER,
      B4: DataTypes.INTEGER,
      B5: DataTypes.INTEGER,
      I1: DataTypes.INTEGER,
      I2: DataTypes.INTEGER,
      I3: DataTypes.INTEGER,
      I4: DataTypes.INTEGER,
      I5: DataTypes.INTEGER,
      N1: DataTypes.INTEGER,
      N2: DataTypes.INTEGER,
      Free: DataTypes.STRING,
      N4: DataTypes.INTEGER,
      N5: DataTypes.INTEGER,
      G1: DataTypes.INTEGER,
      G2: DataTypes.INTEGER,
      G3: DataTypes.INTEGER,
      G4: DataTypes.INTEGER,
      G5: DataTypes.INTEGER,
      O1: DataTypes.INTEGER,
      O2: DataTypes.INTEGER,
      O3: DataTypes.INTEGER,
      O4: DataTypes.INTEGER,
      O5: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Card",
    }
  );
  return Card;
};
