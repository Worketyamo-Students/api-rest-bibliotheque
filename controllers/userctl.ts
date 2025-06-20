import { Request, Response  , NextFunction} from 'express';
import { PrismaClient } from '../generated/prisma';
import {User} from "../generated/prisma"
const client = new PrismaClient();
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
    }
}
export default userctl;