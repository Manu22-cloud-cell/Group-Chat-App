const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ArchivedPrivateMessage = sequelize.define(
  "ArchivedPrivateMessage",
  {
    roomId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
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
    updatedAt: false, // archive data never changes
  }
);

module.exports = ArchivedPrivateMessage;
