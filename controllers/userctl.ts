
import { Request, Response  , NextFunction} from 'express';
import { PrismaClient } from '../generated/prisma';
import {User} from "../generated/prisma"
import crypt from 'bcrypt'
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
const client = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET
const userctl = {
    createUser: async (req: Request, res: Response , next : NextFunction) => {
    const { name , email , password}: User = req.body
      if (!name || !email || !password) {
         res.status(400).json({ msg: "veuillez remplir tout les champs" })
      } else {
            // const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            // if (!emailRegex.test(email)) {
            //     return res.status(400).json({ msg: "Email invalide" });
                
            // }
        
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

    },
    loginUser: async (req: Request, res: Response , next : NextFunction) => {

        const { email, password }: User = req.body;

        //generate token
        if (!email || !password) {
            res.status(400).json({ msg: "veuillez remplir tous les champs" });
        } else {
            try {
                const user = await client.user.findUnique({
                    where: { email }
                });

                if (!user || user.password !== password ) {
                    throw new Error("Invalid email or password");
                }

                res.status(200).json({
                    msg: "Login successful",
                    user: { id: user.userId, name: user.name, email: user.email }
                });
                //generer le token jwt

            } catch (error) {
                next(error);
                res.status(500).json({ msg: "Internal server error" });
            }
        }
    },
    getUserById: async (req: Request, res: Response) => {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "Invalid user ID" });
        }
        try {
            const user = await client.user.findUnique({
                where: { userId }
            });
            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    },
    updateUserProfile: async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        const { name, email, password }: User = req.body;

        if (!userId || !name || !email) {
            return res.status(400).json({ msg: "veuillez remplir tout les champs" });
        }

        try {
            const cryptpassword = await crypt.hash(password, 10);

            const user = await client.user.update({
                where: { userId },
                data: {
                    name,
                    email,
                    password : cryptpassword // Hash password if provided
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
    },
    deleteUserProfile: async (req: Request, res: Response) => {
        const { userId } = req.params
        if (!userId) {
            res.status(400).json({ msg: "No ID provided" })
        } else {
            const user = await client.user.delete({
                where: {
                    userId
                }
            })
            if (user) {
                res.status(200).json({ msg: "user deleted successfully" })
            } else {
                res.status(404).json({ msg: "user not found" })
            }
        }

    }
}
export default userctl; 