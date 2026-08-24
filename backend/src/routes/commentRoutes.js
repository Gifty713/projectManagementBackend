import { Router } from "express";
import { authToken } from "../middleware/jsonAuth.js";
import { newComment, getComments } from "../controllers/commentControllers.js";

const commentRoute = Router();
commentRoute.route("/newcomment/:project_id").post(authToken, newComment);
commentRoute.route("/getcomments/:project_id").get(authToken, getComments);

export default commentRoute;