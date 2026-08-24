import { Router } from "express";
import { newComment, getComments } from "../controllers/commentControllers.js";

const commentRoute = Router();
commentRoute.route("/newcomment").post(newComment);
commentRoute.route("/getcomments").get(getComments);

export default commentRoute;