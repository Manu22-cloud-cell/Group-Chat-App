const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

router.post("/create", authMiddleware, groupController.createGroup);
router.get("/", authMiddleware, groupController.getMyGroups);
router.post("/add-member",authMiddleware,groupController.addMember);
router.get("/:groupId", authMiddleware, groupController.getGroupDetails);

module.exports = router;
