const express=require("express");
const router=express.Router();
const upload=require("../middleware/upload");
const mediaController=require("../controllers/mediaController");
const auth=require("../middleware/authMiddleware");

router.post("/upload",auth,upload.single("file"),mediaController.uploadMedia);

module.exports=router;