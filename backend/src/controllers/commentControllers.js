import pool from "../config/database.js";
import { resend } from "../app.js";
const newComment=async(req, res)=>{
    try {
        const {comment, mentionId} = req.body;
        const sender = req.user;
        const project_id = req.params.project_id;
        // validate if this project is available
        const foundProject = await pool.query(`
            SELECT EXISTS(
                SELECT 1
                FROM projects
                WHERE project_id = $1              
            )  
        `,[project_id]);     

        if(!foundProject.rows[0].exists) return(res.status(404).json({message:"Can't find this project, enter valid project id."})); 
        
        // to check mentioned and send an email
        if (mentionId){
            // check if this is a valid user id in the particular project
            const resultExists = await pool.query(`
              SELECT EXISTS(
                SELECT 1 
                FROM members
                WHERE user_id = $1 AND project_id = $2
              )  
            `,[mentionId, project_id]);
            if (!resultExists.rows[0].exists) return res.status(404).json({message:"Couldn't find said user in this project."});
            
            // find user email
            const resultUser = await pool.query(`
              SELECT *
              FROM users
              WHERE id = $1
            `, [mentionId]);
            const resultEmail = resultUser.rows[0].email;

            // if user not online in 1 hour then send email
            setTimeout(async()=>{
                const sockets = await req.io.fetchSockets();
                const userIsOnline = sockets.some(
                    socket => socket.userId === mentionId
                );
                if (!userIsOnline){
                    const {data, error} = await resend.emails.send({
                        from:"My APi <>",
                        to: [`${resultEmail}`],
                        subject:"Somebody mentioned you."
                    })
                    if (error) {
                        console.error("Error in sending email.", error);
                    }
                }
            },3600000);
        };
        // result
        const result = await pool.query(`
           INSERT INTO comments(comment, sender, project_parent)
           VALUES ($1, $2, $3)
           RETURNING *
        `,[comment, sender, project_id]);

        res.status(200).json({message:"Comment added successfully.", result: result.rows[0]});
        // broadcast the message
        req.io.to(`roomId:${project_id}`).emit("commented",{
            comment,
            sender
        })

    } catch (error) {
        res.status(500).json({message:"Internal server error, error in creating comment.", error:error.message});                       
    }
}

const getComments=async(req, res)=>{
    try {
        const project_id = req.params.project_id;
        const result = await pool.query(`
            SELECT * 
            FROM comments
            WHERE project_parent = $1
            `, [project_id]
        );
        if (result.rows.length == 0) return res.status(404).json({message:"Couldn't find comments."});
        const data = result.rows;
        res.status(200).json({message:"Comments gotten.", data});
    } catch (error) {
        res.status(500).json({message:"Internal server error, error in getting comments.", error:error.message});                       
    }
}

export {newComment, getComments};