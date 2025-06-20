import { Router } from "express";
import userctl from "../controllers/userctl.ts"

const user = Router()

user.post("/", userctl.createUser);
user.post("/login", userctl.loginUser);
export default user