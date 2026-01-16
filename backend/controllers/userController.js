const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const users = await User.findAll({
      where: {
        id: { [require("sequelize").Op.ne]: loggedInUserId },
      },
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error("Fetch users failed:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
