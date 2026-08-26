import pool from "../config/database.js";
const createProject = async(req,res)=>{
    try {
        // defining variables
        const {project_name} = req.body;
        const workspace_id = req.params.id;
        const user_id = req.user;

        // validating project_name
        if(!project_name) return res.status(400).json({message:"You need to add a workspace name"});
        let project_named = project_name;
         
        // check to see if there's a workspade with that name
        const resultCount = await pool.query(`
            SELECT COUNT(*)
            FROM projects
            WHERE project_name LIKE $1
            `, [`${project_name}%`]
        );

        // adding an extra number to the name if the project is found, 
        // so people can name a project the same thing without issues
        const num = resultCount.rows[0].count;
        if (num > 0){
            project_named = project_named + String(num);
        };


        // create project
        const result = await pool.query(`
            INSERT INTO projects(project_name, workspace_parent)
            VALUES($1, $2)
            RETURNING  *
        `, [project_named, workspace_id]);

        // create a first members id with role Admin
        await pool.query(`
            INSERT INTO members(user_id, project_id, role)
            VALUES ($1, $2, $3)
        `, [user_id, result.rows[0].project_id, "Admin"]);
        
        res.status(200).json({message:"Project successfully created.", result: result.rows[0]});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in creating project.", error:error.message});        
    }
}

const getProjects = async(req, res)=>{
    try {
        // workspace id
        const workspace_id = req.params.id;
        // get all projects with same workspace parent 
        const result = await pool.query(`
            SELECT * 
            FROM projects 
            WHERE workspace_parent = $1
        `, [workspace_id]);
        const data = result.rows;
        if (data.length === 0) return res.status(200).json({message:"You currently don't have any projects."});
        res.status(200).json({message:"Projects gotten: ", data});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in getting projects.", error:error.message});        
    }
}

const getParticularProject = async(req, res)=>{
    try {
        // project id
        const project_id = req.params.id;

        // get project with same project id
        const result = await pool.query(`
            SELECT * 
            FROM projects 
            WHERE project_id = $1
        `, [project_id]);
        // validate result
        if (result.rows.length === 0) res.status(404).json({message:"This project was not found."});
        // return result
        res.status(200).json({message:"Project found: ", result:result.rows[0]});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in getting particular project.", error:error.message});                
    }
}

const deleteProject = async(req,res)=>{
    try {
        const user_id = req.user;
        const project_id = req.params.id;
        // validate if this project is available
        const foundProject = await pool.query(`
            SELECT EXISTS(
                SELECT 1
                FROM projects
                WHERE project_id = $1              
            )  
        `,[project_id]);     

        if(!foundProject.rows[0].exists) return(res.status(404).json({message:"Can't find this project, enter valid project id."})); 
        // check if admin or project manager
        const resultAdmin = await pool.query(`
            SELECT *
            FROM members 
            WHERE project_id = $1 AND user_id = $2 AND (role = 'Admin' or role ='Project Manager')
        `, [project_id, user_id]);
        if (resultAdmin.rows.length === 0) return res.status(401).json({message:"You are not permitted to delete this project."});
        // delete members
        const resultM = await pool.query(`
            DELETE FROM members
            WHERE project_id = $1
        `, [project_id]);       
        // delete project
        const result = await pool.query(`
            DELETE FROM projects
            WHERE project_id = $1
            RETURNING project_name
        `, [project_id]);
        res.status(203).json({message:"Project successfully deleted", result:result.rows[0]});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in deleting project.", error:error.message});               
    }
}

export {createProject, getProjects,getParticularProject ,deleteProject};