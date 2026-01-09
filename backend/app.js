require("dotenv").config();
const express=require("express");
const cors=require("cors");

//import models
const {sequelize}=require("./models");

const authRoutes=require("./routes/authRoutes");
const messageRoutes=require("./routes/messageRoutes");

const app=express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//ROUTES
app.use("/auth",authRoutes);
app.use("/message",messageRoutes);

//DB SYNC & SERVER
sequelize
.sync()
.then(()=>{
    console.log("Database synced");
    const PORT=process.env.PORT || 3000;
    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err)=>console.error("DB sync failed:",err));
