const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const auth = require("../middleware/authMiddleware");

router.post("/predict", auth, aiController.predictText);
router.post("/smart-reply", auth, aiController.smartReplies);

module.exports = router;
