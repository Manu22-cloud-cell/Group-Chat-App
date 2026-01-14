const express=require("express");
const router=express.Router();
const authMiddleware=require("../middleware/authMiddleware");
const personalChatUser=require("../controllers/userController");

router.get("/by-email",authMiddleware,personalChatUser.findUser)

module.exports=router;