const sequelize = require("../config/database");

const User = require("./User");
const Message = require("./message");
const Group = require("./Group");
const GroupMember = require("./GroupMember");

/* ========================= */
/* MESSAGE ASSOCIATIONS */
/* ========================= */

User.hasMany(Message, { foreignKey: "UserId" });
Message.belongsTo(User, { foreignKey: "UserId" });

/* ========================= */
/* GROUP ASSOCIATIONS */
/* ========================= */

// Group ↔ GroupMember
Group.hasMany(GroupMember, { foreignKey: "groupId" });
GroupMember.belongsTo(Group, { foreignKey: "groupId" });

// User ↔ GroupMember
User.hasMany(GroupMember, { foreignKey: "userId" });
GroupMember.belongsTo(User, { foreignKey: "userId" });

// Many-to-Many
User.belongsToMany(Group, {
    through: GroupMember,
    foreignKey: "userId"
});

Group.belongsToMany(User, {
    through: GroupMember,
    foreignKey: "groupId"
});

/* ========================= */
/* EXPORT EVERYTHING */
/* ========================= */

module.exports = {
    sequelize,
    User,
    Message,
    Group,
    GroupMember
};
