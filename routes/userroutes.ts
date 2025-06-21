import { Router } from "express";
import userctl from "../controllers/userctl.ts"

const user = Router()

user.post("/", userctl.createUser);
user.post("/login", userctl.loginUser);
// user.get("/profile", userctl.getUserById);
user.put("/profile", userctl.updateUserProfile);
user.delete("/profile", userctl.deleteUserProfile);
export default user