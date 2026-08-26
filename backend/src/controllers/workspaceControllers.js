import pool from "../config/database.js";
const createWorkspace = async(req, res)=>{
    try {
        const {workspace_name} = req.body;
        // validate workspace name
        if(!workspace_name) return res.status(400).json({message:"You need to add a workspace name"});
        let workspace_named = workspace_name;
         
        // check to see if there's a workspade with that name
        const resultCount = await pool.query(`
            SELECT COUNT(*)
            FROM workspaces
            WHERE workspace_name LIKE $1
            `, [`${workspace_name}%`]
        );

        // adding an extra number to the name if the workspace is found, 
        // so people can name a workspace the same thing without issues
        const num = resultCount.rows[0].count;
        if (num > 0){
            workspace_named = workspace_named + String(num);
        };

        // user id that created the workspace
        const created_by = req.user;
    
        const result = await pool.query(`
            INSERT INTO workspaces(workspace_name, created_by)
            VALUES ($1, $2) 
            RETURNING workspace_name
            `, [workspace_named, created_by]
        );
    
        const row = result.rows[0];
        res.status(200).json({message:"Workspace successfully created.", row});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in creating workspace.", error:error.message});
    }
}

const getWorkspaces = async(req, res)=>{
    try {
        // user id
        const user_id = req.user;
        // get all workspaces with that created by id
        const result = await pool.query(`
            SELECT * 
            FROM workspaces 
            WHERE created_by = $1
        `, [user_id]);
        const data = result.rows;
        if (data.length === 0) return res.status(200).json({message:"You currently don't have any workspace."});
        res.status(200).json({message:"Workspaces gotten: ", data});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in getting workspaces.", error:error.message});        
    }
}

const particularWorkspace=async(req,res)=>{
    try {
        const workspace_id = req.params.workspace_id;
        // select the workspace with the same id
        const result = await pool.query(`
            SELECT *
            FROM workspaces
            WHERE workspace_id = $1
        `, [workspace_id]);
        const data = result.rows;
        if (data.length === 0) return res.status(404).json({message:"Could not find this workspace."});
        res.status(200).json({message:"Successfully found the workspace.", data});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in getting particular workspace.", error:error.message});                
    }
}

const deleteWorkspace = async(req,res)=>{
    try {
        const workspace_id = req.params.workspace_id;
        const user_id = req.user;
        // validate if this workspace is available
        const foundWorkspace = await pool.query(`
            SELECT EXISTS(
                SELECT 1
                FROM workspaces
                WHERE workspace_id = $1              
            )  
        `,[workspace_id]);     

        if(!foundWorkspace) return(res.status(404).json({message:"Can't find this workspace, enter valid workspace id."})); 
        // validate if admin
        const resultAdmin = await pool.query(`
            SELECT *
            FROM workspaces 
            WHERE workspace_id = $1 AND created_by = $2 
        `, [workspace_id, user_id]);
        if (resultAdmin.rows.length === 0) return res.status(401).json({message:"You are not permitted to delete this workspace."});

        // delete workspace
        const result = await pool.query(`
            DELETE FROM workspaces
            WHERE workspace_id = $1
            RETURNING workspace_name
        `, [workspace_id]);
        res.status(203).json({message:"Workspace successfully deleted", result:result.rows[0]});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in deleting workspace.", error:error.message});               
    }
}
export {createWorkspace, getWorkspaces, particularWorkspace, deleteWorkspace};