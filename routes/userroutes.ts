import { Router } from "express";
import userctl from "../controllers/userctl.ts"
import { asyncHandler } from "../asynchandler.ts";
import { Request, Response , NextFunction} from 'express';
import { PrismaClient, User } from '../generated/prisma';
import crypt from 'bcrypt';

const client = new PrismaClient();
const user = Router()

user.post("/", asyncHandler(async (req: Request, res: Response , next : NextFunction) => {
    const { name , email , password}: User = req.body
      if (!name || !email || !password) {
         res.status(400).json({ msg: "veuillez remplir tout les champs" })
      } else {
            const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ msg: "Email invalide" });
                
            }
        
            try {
                const cryptpassword = await crypt.hash(password, 10);
                
                const existingUser = await client.user.findUnique({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({ msg: "cet utilisateur existe deja" });
                }
                const user = await client.user.create({
                    data: {
                        name,
                        email,
                        password: cryptpassword
                    }
                });

                console.log(user)
                res.status(201).json({
                msg: `user ${user.name} cree avec succes`
                })
            next();
            } 
            catch (error) {
                next(error);
                res.status(500).json({ msg: "Internal server error" })
            }
      }

    }));
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