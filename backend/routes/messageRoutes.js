const express=require("express");
const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");
const messageController=require("../controllers/messageController");

router.post("/send",authMiddleware,messageController.sendMessage);

module.exports=router;