import { Router } from "express";
import { createProject, getProjects, getParticularProject, deleteProject } from "../controllers/projectControllers.js";
import { authToken } from "../middleware/jsonAuth.js";

const projectRoute = Router();

// routes for projects
projectRoute.route("/createproject/:id").post(authToken, createProject);
projectRoute.route("/getprojects/:id").get(authToken, getProjects);
projectRoute.route("/getparticularproject/:id").get(authToken, getParticularProject);
projectRoute.route("/deleteproject/:id").delete(authToken, deleteProject);

export default projectRoute;