require("dotenv").config();
const express=require("express");
const cors=require("cors");

const sequelize=require("./config/database");
const authRoutes=require("./routes/authRoutes");

const app=express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//ROUTES
app.use("/",authRoutes);

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
