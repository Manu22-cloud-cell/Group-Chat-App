const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const messageController = require("../controllers/messageController");

/* PERSONAL CHAT */
router.post(
  "/private/send",
  authMiddleware,
  messageController.sendPrivateMessage
);

router.get(
  "/private/:userId",
  authMiddleware,
  messageController.getPrivateMessages
);

router.get(
  "/private/:userId/older",
  authMiddleware,
  messageController.loadOlderPrivateMessages
);

/* GROUP CHAT */
router.post(
  "/group/send",
  authMiddleware,
  messageController.sendGroupMessage
);

router.get(
  "/group/:groupId",
  authMiddleware,
  messageController.getGroupMessages
);

router.get(
  "/group/:groupId/older",
  authMiddleware,
  messageController.loadOlderGroupMessages
);

module.exports = router;
