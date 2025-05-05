import { Router } from "express";
import { signup, login, addToHistory, getUserHistory } from "../controller/user.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = Router();

router.route("/signup")
    .post(wrapAsync(signup));

router.route("/login")
    .post(wrapAsync(login));

router.route("/addToActivity")
    .post(wrapAsync(addToHistory));

router.route("/getAllActivity")
    .get(wrapAsync(getUserHistory));

export default router;