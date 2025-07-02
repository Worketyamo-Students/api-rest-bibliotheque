

import { Request, Response  , NextFunction} from 'express';
import { PrismaClient } from '../generated/prisma';
import {User} from "../generated/prisma"
import {signrefreshToken, signToken , validateentries} from "../asynchandler.ts"
import crypt from 'bcrypt'

// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
const client = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET
const userctl = {
    createUser: async (req: Request, res: Response , next : NextFunction) => {
    const { name , email , password}: User = req.body
            try {
                const { error } = validateentries.validate(req.body);
                if (error){
                    return res.status(400).json({ msg: error.message });
                }
                else{
                    
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
            } 
            catch (error) {
                next(error);
                res.status(500).json({ msg: "Internal server error" })
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

                if (!user || !(await crypt.compare(password, user.password))) {
                    throw new Error("Invalid email or password");
                }
                else{
                    const refreshtoken = await signrefreshToken(user.email);
                    res.cookie("cookie-wyx", refreshtoken)
                    const token = await signToken(user.email);
                    console.log(token)
                    
                    res.status(200).json({
                        msg: `bienvenue ${user.name}`,
                        user: { id: user.userId, name: user.name, email: user.email },
                        accessToken: token
                    });

                }
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
        else {
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

        }
    },
    updateUserProfile: async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        const { name, email, password }: User = req.body;

        if (!userId) {
            return res.status(400).json({ msg: "No ID provided" });
        }
        else if (!name || !email) {
            return res.status(400).json({ msg: "veuillez remplir tout les champs" });
        }
        else{
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