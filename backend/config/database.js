const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    "group_chat_app",
    "root",
    "252582",
    {
        host: "localhost",
        dialect: "mysql",
        logging: false,
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Unable to connect to DB:", error.message);
    }
})();

module.exports = sequelize;

