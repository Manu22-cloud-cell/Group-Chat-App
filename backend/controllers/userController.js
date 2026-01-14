const User = require("../models/User");

exports.findUser = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({
            where: { email },
            attributes: ["id", "name", "email"],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });

    } catch (error) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user" });
    }
}