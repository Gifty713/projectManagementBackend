import express from "express";
import { Server } from "socket.io";
import {createServer} from "http";
import cors from "cors";
import {Resend} from "resend";
import authRoute from "./routes/AuthRoutes.js";
import workspaceRoute from "./routes/workspaceRoutes.js";
import projectRoute from "./routes/projectRoutes.js";
import memberRoute from "./routes/memberRoutes.js";
import taskRoute from "./routes/taskRoutes.js";
import commentRoute from "./routes/commentRoutes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
// App config
const app = express();
app.use(express.json());
app.use(cors(
    {origin: process.env.FRONTEND_ORIGIN, credentials:true}
));
app.use(cookieParser());
// SOcket connection
const httpServer = createServer(app);
const io = new Server(httpServer, {cors:{origin: process.env.FRONTEND_ORIGIN, credentials:true}});

app.use((req, res, next)=>{
    req.io = io;
    next();
})

io.on("connection", (socket)=>{
    // link user id to socket
    socket.on("authenticate",(userId)=>{
        socket.userId = userId
    });
    // connect the user to the project_room chat
    socket.on("join_room", (project_id)=>{
        socket.join(`roomId:${project_id}`)
    });
});

// resend config
const resend = new Resend(process.env.RESEND_KEY);

// Swagger connection
app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(
        swaggerSpec, {swaggerOptions:{
            withCredentials: true
        }
    })
);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/workspace", workspaceRoute);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/members", memberRoute);
app.use("/api/v1/tasks", taskRoute);
app.use("/api/v1/comments", commentRoute);

export {app, httpServer, resend};
