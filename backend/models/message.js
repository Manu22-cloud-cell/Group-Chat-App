const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define(
    "Message",
    {
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        tableName: "messages",
        timestamps: true,
    }
)

module.exports = Message;