import {app} from "./app.js";
import dotenv from "dotenv";

dotenv.config({
    path:"./.env"
})

const startServer=async()=>{
    try {
        app.on("error", (error)=>{
            console.log("Error occurred: ", error);
            throw error;
        });       
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Connection successful on port ${process.env.PORT}`)
        });
 
    } catch (error) {
        console.log("Error in starting server.", error);
    }
}

startServer();