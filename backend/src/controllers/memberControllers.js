import pool from "../config/database.js";
import redisClient from "../config/redisDatabase.js";
import { nanoid } from "nanoid";

const createInviteCodes =async(req, res)=>{
    try {
        const {role} = req.body;
        const user_id = req.user;
        // project id
        const project_id = req.params.id;
        // validate project_id
        const resultProject = await pool.query(`
            SELECT * 
            FROM projects 
            WHERE project_id = $1
        `, [project_id]);
        // validate resultProject
        if (resultProject.rows.length === 0) return res.status(404).json({message:"This project was not found."});

        // validate if user is Admin
        const resultAdmin = await pool.query(`
            SELECT *
            FROM members 
            WHERE project_id = $1 AND user_id = $2 AND role = 'Admin'
        `, [project_id, user_id]);
        if (resultAdmin.rows.length === 0) return res.status(401).json({message:"You are not permitted to create invite code."});

        // role validation
        const validRoles = [
            "Project Manager",
            "Team Manager",
            "Team Member"
        ];

        if (!validRoles.includes(role)) return res.status(400).json({message:"We only support 3 roles; Project Manager, Team Manager, Team Member. Choose between these 3 roles."});

        // create invite code 
        let invite_code = nanoid(10);
        if (!redisClient.isReady) {
            return res.status(503).json({
                message: "Invite codes are temporarily unavailable."
            });
        }
        // validate if unique
        let  exists = await redisClient.exists(`invite:${invite_code}`);
        while (exists){
            invite_code = nanoid(10);
            exists = await redisClient.exists(`invite:${invite_code}`);
        }
        // store invite code
        await redisClient.set(
            `invite:${invite_code}`,
            JSON.stringify({
                project_id,
                role
            }),
            {
                EX: 7200
            }
        )
        res.status(200).json({message:"Invite code created.", role, invite_code});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in creating invite code.", error:error.message});                        
    }
}

const inviteMember= async(req,res)=>{
    try {
        if (!redisClient.isReady) {
            return res.status(503).json({
                message: "Invite codes are temporarily unavailable."
            });
        }
        const {invite_code} = req.body;
        const user_id = req.user;
        // validate invite link
        const isInvited = JSON.parse(
            await redisClient.get(`invite:${invite_code}`)
        );
        if (!isInvited) return res.status(401).json({message:"Invite code invalid."});

        const {project_id, role} = isInvited;
        // create member record
        const result = await pool.query(`
            INSERT INTO members(user_id, project_id, role)
            VALUES ($1, $2, $3)
        `, [user_id, project_id, role]);

        res.status(200).json({message:"Member successful added."});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in adding member", error:error.message});                                
    }
}

const editMember = async(req, res)=>{
    try {
        const admin_id = req.user;
        const project_id = req.params.id;
        const {role, user_id} = req.body;
        // check if the admin or project manager requesting this
        const resultAdmin = await pool.query(`
            SELECT *
            FROM members 
            WHERE project_id = $1 AND user_id = $2 AND (role = 'Admin' OR role = 'Project Manager')
        `, [project_id, admin_id]);
        if (resultAdmin.rows.length === 0) return res.status(401).json({message:"You are not permitted to edit members."});
        
        // role validation again
        const validRoles = [
            'Project Manager',
            'Team Manager',
            'Team Member'
        ];

        if (!validRoles.includes(role)) return res.status(400).json({message:"We only support 3 roles; Project Manager, Team Manager, Team Member. Choose between these 3 roles."});

        // edit member
        const result = await pool.query(`
            UPDATE members
            SET role = $1
            WHERE project_id = $2 AND user_id = $3    
        `,[role, project_id, user_id]);
        res.status(200).json({message:"Member editted successfully."});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in adding member", error:error.message});                                        
    }
}

const deleteMember = async(req, res)=>{
    try {
        const user_id = req.user;
        const project_id = req.params.id;
        const {member_id} = req.body;
        // check if the admin or project manager requesting this
        const resultAdmin = await pool.query(`
            SELECT *
            FROM members 
            WHERE project_id = $1 AND user_id = $2 AND (role = 'Admin' OR role = 'Project Manager')
        `, [project_id, user_id]);
        if (resultAdmin.rows[0].length === 0) return res.status(401).json({message:"You are not permitted to edit members."});        
        
        // delete member 
        const result = await pool.query(`
            DELETE FROM members
            WHERE member_id = $1 
        `,[member_id]);
        res.status(200).json({message:"Member deleted successfully."});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in deleting member.", error:error.message});                                                
    }
}

const getMembers = async(req, res)=>{
    try {
        const {project_id} = req.body;
        // validate project_id 
        const resultProject = await pool.query(`
            SELECT * 
            FROM projects 
            WHERE project_id = $1
        `, [project_id]);
        // validate result
        if (resultProject.rows[0].length === 0) res.status(404).json({message:"This project was not found."});

        // find users
        const resultUser = await pool.query(`
            SELECT user_id 
            FROM members
            WHERE project_id = $1    
        `,[project_id]);
        const user_ids = resultUser.rows[0];

        // use user ids to get members
        res.status(200).json({message:"Successful", user_ids}); 
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in getting members.", error:error.message});                                                        
    }
}
export {createInviteCodes, inviteMember, editMember, deleteMember, getMembers};
