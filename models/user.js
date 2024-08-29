"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.SelectedCard, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      telegramId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wallet: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users", // Explicitly define table name to avoid pluralization
      timestamps: true, // Automatically manages `createdAt` and `updatedAt` fields
    }
  );
  return User;
};
