const sequelize = require("../config/sequelize");


const User = require("./User");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const PrivateMessage = require("./PrivateMessage");
const GroupMessage = require("./GroupMessage");

// PRIVATE CHAT ASSOCIATIONS
   
// Sender
User.hasMany(PrivateMessage, {
  foreignKey: "senderId",
  as: "SentMessages",
});

PrivateMessage.belongsTo(User, {
  foreignKey: "senderId",
  as: "Sender",
});

// Receiver
User.hasMany(PrivateMessage, {
  foreignKey: "receiverId",
  as: "ReceivedMessages",
});

PrivateMessage.belongsTo(User, {
  foreignKey: "receiverId",
  as: "Receiver",
});

// GROUP & MEMBERS ASSOCIATIONS
  
// Group ↔ GroupMember
Group.hasMany(GroupMember, { foreignKey: "groupId" });
GroupMember.belongsTo(Group, { foreignKey: "groupId" });

// User ↔ GroupMember
User.hasMany(GroupMember, { foreignKey: "userId" });
GroupMember.belongsTo(User, { foreignKey: "userId" });

// Many-to-Many (Users ↔ Groups)
User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: "userId",
});

Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: "groupId",
});

/* GROUP MESSAGE ASSOCIATIONS */

Group.hasMany(GroupMessage, { foreignKey: "groupId" });
GroupMessage.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(GroupMessage, { foreignKey: "senderId" });
GroupMessage.belongsTo(User, { foreignKey: "senderId" });

/* EXPORTS */

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  PrivateMessage,
  GroupMessage,
};
