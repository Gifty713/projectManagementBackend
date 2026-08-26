import pool from "../config/database.js";
const createTask = async(req,res)=>{
    try {
        // defining variables
        const {task_name, due_date, assigned_to} = req.body;
        const project_id = req.params.project_id;
        const user_id = req.user;

        // validate project_id
        const foundProject = await pool.query(`
            SELECT EXISTS(
                SELECT 1
                FROM projects
                WHERE project_id = $1              
            )  
        `,[project_id]);     

        if(!foundProject.rows[0].exists) return(res.status(404).json({message:"Can't find this project, enter valid project id."})); 

        // validating due date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
            return res.status(400).json({
                message: "Due date should not be before today."
            });
        }
        // validating task_name
        if(!task_name) return res.status(400).json({message:"You need to add a task name"});
        let task_named = task_name;
        
        // validating assigned to
        if (!assigned_to) return res.status(400).json({message:"You need to assign this task to someone or somepeople."});
        
        // check to see if there's a task with that name
        const resultCount = await pool.query(`
            SELECT COUNT(*)
            FROM tasks
            WHERE task_name LIKE $1
            `, [`${task_name}%`]
        );

        // adding an extra number to the name if the task is found, 
        // so people can name a task the same thing without issues
        const num = resultCount.rows[0].count;
        if (num > 0){
            task_named = task_named + String(num);
        };
        // checking if admin, project manager, team manager
        const resultAdmin = await pool.query(`
            SELECT *
            FROM members 
            WHERE project_id = $1 AND user_id = $2 AND role = 'Team Member'
        `, [project_id, user_id]);
        if (resultAdmin.rows.length > 0) return res.status(401).json({message:"You are not permitted to create task."});
        // create task
        const result = await pool.query(`
            INSERT INTO tasks(task_name, due_date, assigned_to, project_parent)
            VALUES($1, $2, $3, $4)
            RETURNING  *
        `, [task_named, due_date, assigned_to, project_id]);
        
        res.status(200).json({message:"Task successfully created.", result: result.rows[0]});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in creating task.", error:error.message});        
    }
}

const editTask = async(req, res)=>{
    try {
        // defining variables
        const {task_name, due_date, assigned_to} = req.body;
        const task_id = req.params.task_id;
        const user_id = req.user;

        // valiidating task id
        const foundTask = await pool.query(`
            SELECT *
            FROM tasks
            WHERE task_id = $1                 
        `,[task_id]);     

        if(foundTask.rows.length === 0) return(res.status(404).json({message:"Can't find this task, enter valid task id."})); 
        // get project parent
        const project_id = foundTask.rows[0].project_parent;
        // checking if admin, project manager, team manager
        const resultAdmin = await pool.query(`
            SELECT *
            FROM members 
            WHERE project_id = $1 AND user_id = $2 AND role = 'Team Member'
        `, [project_id, user_id]);
        if (resultAdmin.rows.length > 0) return res.status(401).json({message:"You are not permitted to edit task."});
        
        // validating due date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
            return res.status(400).json({
                message: "Due date should not be before today."
            });
        }

        // validating task_name
        if(!task_name) return res.status(400).json({message:"You need to add a task name"});
        let task_named = task_name;
        
        // validating assigned to
        if (!assigned_to) return res.status(400).json({message:"You need to assign this task to someone or somepeople."});
        
        // check to see if there's a task with that name
        const resultCount = await pool.query(`
            SELECT COUNT(*)
            FROM tasks
            WHERE task_name LIKE $1
            `, [`${task_name}%`]
        );

        // adding an extra number to the name if the task is found, 
        // so people can name a task the same thing without issues
        const num = resultCount.rows[0].count;
        if (num > 0){
            task_named = task_named + String(num);
        };
        // edit task
        const result = await pool.query(`
            UPDATE tasks
            SET task_name = $1, due_date = $2, assigned_to = $3, updated_at = $4
            WHERE task_id = $5
            RETURNING  *
        `, [task_named, due_date, assigned_to, today ,task_id]);
        
        res.status(200).json({message:"Task successfully created.", result: result.rows[0]});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in editting task.", error:error.message});                
    }
}

const deleteTask = async(req,res)=>{
    try {
        const user_id = req.user;
        const task_id = req.params.task_id;     
        // valiidating task id
        const foundTask = await pool.query(`
            SELECT *
            FROM tasks
            WHERE task_id = $1                 
        `,[task_id]);     

        if(foundTask.rows.length === 0) return(res.status(404).json({message:"Can't find this task, enter valid task id."})); 
        // get project parent
        const project_id = foundTask.rows[0].project_parent;
        // checking if admin, project manager, team manager
        const resultAdmin = await pool.query(`
            SELECT *
            FROM members 
            WHERE project_id = $1 AND user_id = $2 AND role = 'Team Member'
        `, [project_id, user_id]);
        if (resultAdmin.rows.length > 0) return res.status(401).json({message:"You are not permitted to edit task."});

        // delete task
        const result = await pool.query(`
            DELETE FROM tasks
            WHERE task_id = $1
            RETURNING task_name
        `, [task_id]);
        res.status(203).json({message:"Task successfully deleted", result:result.rows[0]});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in deleting task.", error:error.message});               
    }
}

const changeStatus = async(req, res)=>{
    try {
        const {status}= req.body;
        const user_id = req.user;
        const task_id = req.params.task_id;
        // validate status
        const validStatus = ["In progress", "Done", "Approved"];
        if (!validStatus.includes(status)) return res.status(400).json({message:"This task status is not a valid status."});
        
        // check if task is valid
        // valiidating task id
        const foundTask = await pool.query(`
            SELECT *
            FROM tasks
            WHERE task_id = $1                 
        `,[task_id]);     

        if(foundTask.rows.length === 0) return(res.status(404).json({message:"Can't find this task, enter valid task id."})); 
        // get project parent
        const project_id = foundTask.rows[0].project_parent;
        // checking if admin, project manager, team manager
        const resultAdmin = await pool.query(`
            SELECT *
            FROM members 
            WHERE project_id = $1 AND user_id = $2 
        `, [project_id, user_id]);
        if (resultAdmin.rows.length === 0) return res.status(401).json({message:"You are not permitted to edit task."});
        const result = resultAdmin.rows;
        const role = result[0].role;
        // Any assigned member (team member, team manager, project manager or admin) 
        // can change a status from to do->in progress->done, but only team managers, project manager or admin can change a project from done -> approved 
        if (role === "Team Member" && status === "Approved") res.status(401).json({message:"You are not authorized to change the status to approved."});
        
        // update
        await pool.query(`
            UPDATE tasks
            SET task_status = $1
            WHERE task_id = $2
        `,[status, task_id]);
        res.status(200).json({messag:"Status successfully to: ", status});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in changing task status.", error:error.message});                       
    }
}

const getTasks = async(req, res)=>{
    try { 
        // getting tasks is by the task status
        const project_id = req.params.project_id;
        const status = req.params.status;

        // validate status
        const validStatus = ["to do","In progress", "Done", "Approved"];
        if (!validStatus.includes(status)) return res.status(400).json({message:"This task status is not a valid status."});

        const result = await pool.query(`
           SELECT * 
           FROM tasks 
           WHERE project_parent = $1 AND task_status = $2
        `,[project_id, status]);
        
        if (result.rows.length == 0) return res.status(200).json({message:"There's no task with that status at the moment."});
       
        res.status(200).json({message:"Tasks successfully gotten.", result:result.rows});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in getting tasks.", error:error.message});                               
    }
}

export {createTask, editTask, deleteTask, changeStatus, getTasks}; 