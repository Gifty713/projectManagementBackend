import { Router } from "express";
import { createTask, editTask, deleteTask, changeStatus, getTasks } from "../controllers/taskControllers.js";
import { authToken } from "../middleware/jsonAuth.js";
const taskRoute = Router();

taskRoute.route("/createtask/:project_id").post(authToken,createTask);
taskRoute.route("/edittask/:task_id").patch(authToken,editTask);
taskRoute.route("/deletetask/:task_id").delete(authToken,deleteTask);
taskRoute.route("/changestatus/:task_id").patch(authToken,changeStatus);
taskRoute.route("/gettasks/:project_id/:status").get(authToken,getTasks);

export default taskRoute;