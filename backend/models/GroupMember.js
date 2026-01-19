const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const GroupMember = sequelize.define("GroupMember", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false   // ✅ IMPORTANT
    }
});

module.exports = GroupMember;
