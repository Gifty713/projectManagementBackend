import {Router} from "express";
import { createWorkspace, deleteWorkspace, getWorkspaces, particularWorkspace } from "../controllers/workspaceControllers.js";
import { authToken } from "../middleware/jsonAuth.js";

const workspaceRoute = Router();
// routes for workspaces
workspaceRoute.route("/createworkspace").post(authToken, createWorkspace);
workspaceRoute.route("/getworkspaces").get(authToken, getWorkspaces);
workspaceRoute.route("/getparticularworkspace/:workspace_id").get(authToken, particularWorkspace);
workspaceRoute.route("/deleteworkspace/:workspace_id").delete(authToken, deleteWorkspace);

export default workspaceRoute;