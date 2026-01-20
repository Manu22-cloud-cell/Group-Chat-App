const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ArchivedGroupMessage = sequelize.define(
  "ArchivedGroupMessage",
  {
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mediaType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    updatedAt: false,
  }
);

module.exports = ArchivedGroupMessage;
