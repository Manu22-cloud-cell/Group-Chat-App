const sequelize=require("../config/database");
const User=require("../models/User");
const Message=require("../models/message");

//Associations
User.hasMany(Message, {foreignKey:"UserId"});
Message.belongsTo(User, {foreignKey:"UserId"});


module.exports={
    sequelize,
    User,
    Message,
}


