import { Router } from "express";
import userctl from "../controllers/userctl.ts"
import { asyncHandler } from "../asynchandler.ts";
import { Request, Response , NextFunction} from 'express';
import { PrismaClient, User } from '../generated/prisma';

const client = new PrismaClient();
const user = Router()

user.post("/", userctl.createUser);
user.post("/login", userctl.loginUser);
// user.get("/profile", userctl.getUserById);
user.put("/profile", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        const { name, email, password }: User = req.body;

        if (!userId || !name || !email) {
            return res.status(400).json({ msg: "veuillez remplir tout les champs" });
        }

        try {
            const user = await client.user.update({
                where: { userId },
                data: {
                    name,
                    email,
                    password // Hash password if provided
                }
            });

            res.status(200).json({
                msg: `User ${user.name} updated successfully`,
                user
            });
            next()
        } catch (error) {
            next(error)
            res.status(500).json({ msg: "Internal server error" });
        }
    }));
user.delete("/profile", userctl.deleteUserProfile);
export default user