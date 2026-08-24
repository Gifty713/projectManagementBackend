import jwt from "jsonwebtoken";
const authToken=(req, res, next)=>{
    const token = req.headers.cookie
        ?.split(";")
        .map((cookie) => cookie.trim().split("="))
        .find(([name]) => name === "accessToken")
        ?.slice(1)
        .join("=");

    if (!token) return res.status(401).json({message:"Unauthorized user."});

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded )=>{
        if (err){
            if(err.name === "TokenExpiredError") return res.status(401).json({message:"Expired access token"});
            return res.status(403).json({message:"Access Denied"})
        }
        req.user = decoded.id;
        next();
    });
}

const generateAccessToken=(id)=>{
    return jwt.sign(id, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"1h"});
}

export {authToken, generateAccessToken}
