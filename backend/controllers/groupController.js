const Group = require("../models/Group");
const User = require("../models/User");
const GroupMember = require("../models/GroupMember");

exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name) {
            return res.status(400).json({ message: "Group name required" });
        }

        // Create group
        const group = await Group.create({
            name,
            createdBy: userId
        });

        // Add creator as ADMIN member
        await GroupMember.create({
            groupId: group.id,
            userId: req.user.userId,
            isAdmin: true
        });


        res.status(201).json({ group });
    } catch (err) {
        console.error("Create group failed:", err);
        res.status(500).json({ message: "Failed to create group" });
    }
};


exports.getMyGroups = async (req, res) => {
    try {
        const userId = req.user.userId;

        const groups = await Group.findAll({
            include: [{
                model: GroupMember,
                where: { userId },
                attributes: []
            }]
        });

        res.status(200).json({ groups });
    } catch (err) {
        console.error("Fetch groups failed:", err);
        res.status(500).json({ message: "Failed to fetch groups" });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { groupId, userIdToAdd } = req.body;
        const currentUserId = req.user.userId;

        // Check admin
        const admin = await GroupMember.findOne({
            where: {
                groupId,
                userId: currentUserId,
                isAdmin: true
            }
        });

        if (!admin) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        // Prevent duplicates
        const exists = await GroupMember.findOne({
            where: { groupId, userId: userIdToAdd }
        });

        if (exists) {
            return res.status(409).json({ message: "User already in group" });
        }

        await GroupMember.create({
            groupId,
            userId: userIdToAdd
        });

        res.status(200).json({ message: "User added to group" });
    } catch (err) {
        console.error("Add member failed:", err);
        res.status(500).json({ message: "Failed to add member" });
    }
};

exports.getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findOne({
            where: { id: groupId },
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "email"],
                    through: { attributes: ["isAdmin"] }
                }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json({ group });

    } catch (err) {
        console.error("getGroupDetails error:", err);
        res.status(500).json({ message: "Failed to fetch group details" });
    }
};


