import { Router } from "express";
import { authToken } from "../middleware/jsonAuth.js";
import { createInviteCodes, inviteMember, editMember, deleteMember, getMembers } from "../controllers/memberControllers.js";

const memberRoute = Router();

memberRoute.route("/createinvitecodes/:id").post(authToken, createInviteCodes);
memberRoute.route("/invitemember").post(authToken, inviteMember);
memberRoute.route("/editmember/:id").patch(authToken, editMember);
memberRoute.route("/deletemember/:id").delete(authToken, deleteMember);
memberRoute.route("/getmembers").get(authToken, getMembers);

export default memberRoute;