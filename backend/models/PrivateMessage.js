const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const PrivateMessage = sequelize.define("PrivateMessage", {
  roomId: {
    type: DataTypes.STRING,
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
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("sent", "delivered", "read"),
    defaultValue: 'sent'
  }
});

module.exports = PrivateMessage;
