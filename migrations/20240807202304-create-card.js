"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cards", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cardId: {
        type: Sequelize.INTEGER,
      },
      B1: {
        type: Sequelize.INTEGER,
      },
      B2: {
        type: Sequelize.INTEGER,
      },
      B3: {
        type: Sequelize.INTEGER,
      },
      B4: {
        type: Sequelize.INTEGER,
      },
      B5: {
        type: Sequelize.INTEGER,
      },
      I1: {
        type: Sequelize.INTEGER,
      },
      I2: {
        type: Sequelize.INTEGER,
      },
      I3: {
        type: Sequelize.INTEGER,
      },
      I4: {
        type: Sequelize.INTEGER,
      },
      I5: {
        type: Sequelize.INTEGER,
      },
      N1: {
        type: Sequelize.INTEGER,
      },
      N2: {
        type: Sequelize.INTEGER,
      },
      Free: {
        type: Sequelize.STRING,
      },
      N4: {
        type: Sequelize.INTEGER,
      },
      N5: {
        type: Sequelize.INTEGER,
      },
      G1: {
        type: Sequelize.INTEGER,
      },
      G2: {
        type: Sequelize.INTEGER,
      },
      G3: {
        type: Sequelize.INTEGER,
      },
      G4: {
        type: Sequelize.INTEGER,
      },
      G5: {
        type: Sequelize.INTEGER,
      },
      O1: {
        type: Sequelize.INTEGER,
      },
      O2: {
        type: Sequelize.INTEGER,
      },
      O3: {
        type: Sequelize.INTEGER,
      },
      O4: {
        type: Sequelize.INTEGER,
      },
      O5: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Cards");
  },
};
