const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const GroupMessage = sequelize.define("GroupMessage", {
    message: {
      type: DataTypes.TEXT,
      allowNull:true,
    },
    mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mediaType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  });

module.exports=GroupMessage;

 
