import pool from "../config/database.js";
import { hashPassword, comparePasswords } from "../middleware/bcryptFunctions.js";
import { generateAccessToken } from "../middleware/jsonAuth.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
};
const register=async(req, res)=>{
    try { 
        const {firstName, lastName, email, password} = req.body;

        // Validation 
        if (!firstName || !lastName || !email || !password) return res.status(400).json({message:"All fields are required."});

        const emaill = email.toLowerCase();
        const foundEmail = await pool.query(`
          SELECT EXISTS(
            SELECT 1 FROM users
            WHERE email = $1
          )  
        `, [emaill] 
        )
        if (foundEmail.rows[0].exists)return res.status(400).json({message:"This user already exists."});
        // hashing password 
        const hashedPassword = await hashPassword(password);

        // Insert record
        const result = await pool.query(`
            INSERT INTO users(first_name, last_name, email, password)
            VALUES ($1, $2, $3, $4)
            RETURNING first_name, last_name, email     
        `, [firstName, lastName, emaill, hashedPassword]
        );

        // Creating accessToken and Refresh Token 
        res.status(201).json({message:"User created.", user:result.rows[0]});
    } catch (error) {
        res.status(500).json({message:"Server issue in registering user."});
    }
}

const login = async(req, res)=>{
    try {
        const {email, password}= req.body;
        // validate inputs
        if (!email || !password) return res.status(400).json({message:"All fields are required."});
        // verify inputs
        const result = await pool.query(`
            SELECT * 
            FROM users 
            WHERE email = $1
        `, [email] 
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({message:"User not found."});
        // validate password
        const ogPwd = user.password;
        const isPassword = await comparePasswords(password, ogPwd);
        if (!isPassword) return res.status(401).json({message:"Wrong email or password."});

        // Generating access token and refresh token 
        const authId = {id: user.id};
        const accessToken = generateAccessToken(authId);

        const refreshToken = jwt.sign(authId, process.env.REFRESH_TOKEN_SECRET, {expiresIn:"7d"});
        // hash refresh token
        const hashedToken = crypto.hash("sha256",refreshToken, "hex");
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        // Add token to database
        const tokenResult = await pool.query(`
            INSERT INTO refresh_tokens(hashed_token, expired_at, id)
            VALUES ($1, $2, $3)`, 
            [hashedToken, expiryDate, user.id] 
        );
        res
            .cookie("accessToken", accessToken, {...cookieOptions, maxAge: 60 * 60 * 1000})
            .cookie("refreshToken", refreshToken, {...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000})
            .json({message:"Login successful."});
    } catch (error) {
        res.status(500).json({message:"Server issue in logging in user.", error:error.message});        
    }
}

const refreshToken =async(req, res)=>{
    try {
        const token = req.headers.cookie
            ?.split(";")
            .map((cookie) => cookie.trim().split("="))
            .find(([name]) => name === "refreshToken")
            ?.slice(1)
            .join("=");
        // validate token 
        if (!token) return res.status(401).json({message:"Unauthorized user."});

        // hash token
        const hashedAnotherToken = crypto.hash("sha256", token, "hex");
        // find token in db
        const isFound = await pool.query(`
            SELECT EXISTS(
                SELECT 1
                FROM refresh_tokens
                WHERE hashed_token = $1
            )`, [hashedAnotherToken]
        );

        if (!isFound.rows[0].exists) return res.status(403).json({message:"Access denied. Invalid token."});
        
        // Verify token
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
            if(err) return res.status(403).json({message:"Access denied. invalid refresh token."});
            const accessToken = generateAccessToken({id:user.id});
            res
                .cookie("accessToken", accessToken, {...cookieOptions, maxAge: 60 * 60 * 1000})
                .json({message:"Access token refreshed."});
        }); 
    } catch (error) {
        res.status(500).json({message:"Server issue in getting refresh tokens.", error:error.message});                
    }
}
const logout= async(req,res)=>{
    try {
        const token = req.headers.cookie
            ?.split(";")
            .map((cookie) => cookie.trim().split("="))
            .find(([name]) => name === "refreshToken")
            ?.slice(1)
            .join("=");
        if (token){
            const tokenHashed = crypto.hash("sha256", token, "hex");
            const deleted = await pool.query(`
                DELETE FROM refresh_tokens  WHERE hashed_token = $1
                RETURNING refresh_id
            `, [tokenHashed]
            );          
            if (!deleted.rows[0]) return res.status(404).json({message:"Token not found"});  
        };
        res
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .status(200)
            .json({message:"Successful logout"});
    } catch (error) {
        res.status(500).json({message:"Server issue in logging out user.", error:error.message});        
    }
}

export {register, login, refreshToken, logout};
