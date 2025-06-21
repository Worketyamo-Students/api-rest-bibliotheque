import { Request, Response  , NextFunction} from 'express';
import { PrismaClient } from '../generated/prisma';
import {User} from "../generated/prisma"
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
const client = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET
const userctl = {
    createUser: async (req: Request, res: Response) => {
    const { name , email , password}: User = req.body
      if (!name || !email || !password) {
         res.status(400).json({ msg: "veuillez remplir tout les champs" })
      } else {
         try {
            const user = await client.user.create({
            data: {
                name,
                email,
                password
            }
         })

            console.log(user)
            res.status(201).json({
               msg: "user created successfully"
            })
         } catch (error) {
            console.error("Error creating teacher:", error)
            res.status(500).json({ msg: "Internal server error" })
         }
      }

    },
    loginUser: async (req: Request, res: Response , next : NextFunction) => {

        const { email, password }: User = req.body;

        //generate token
        if (!email || !password) {
            res.status(400).json({ msg: "veuillez remplir tout les champs" });
        } else {
            try {
                const user = await client.user.findUnique({
                    where: { email }
                });

                if (!user || user.password !== password) {
                    return next(new Error("Invalid email or password"));
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
    // getUserById: async (req: Request, res: Response) => {
    //     const { userId } = req.params;
    //     if (!userId) {
    //         return res.status(400).json({ msg: "Invalid user ID" });
    //     }
    //     try {
    //         const user = await client.user.findUnique({
    //             where: { userId }
    //         });
    //         if (!user) {
    //             return res.status(404).json({ msg: "User not found" });
    //         }
    //         res.status(200).json(user);
    //     } catch (error) {
    //         console.error("Error fetching user:", error);
    //         res.status(500).json({ msg: "Internal server error" });
    //     }
    // },
    logoutUser: async (req: Request, res: Response) => {
        // Implement logout logic here, e.g., invalidate the session or token
        res.status(200).json({ msg: "User logged out successfully" });
        console.log(req)
    },
    updateUserProfile: async (req: Request, res: Response) => {

    },
    deleteUserProfile: async (req: Request, res: Response) => {
        
    }
}
export default userctl; 