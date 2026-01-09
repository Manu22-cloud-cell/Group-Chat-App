const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Token Missing" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({message:"Unauthorized or token expired"});
    }
};

module.exports=authenticate;