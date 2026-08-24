import { Router } from "express";
import { register, login, refreshToken, logout } from "../controllers/authControllers.js";
import { authToken } from "../middleware/jsonAuth.js";
const authRoute = Router();

authRoute.route("/register").post(register);
authRoute.route("/login").post(login);
authRoute.route("/refreshtoken").post(refreshToken);
authRoute.route("/session").get(authToken, (req, res) => res.json({authenticated: true}));
authRoute.route("/logout").post(logout);

export default authRoute;
