import { Router } from "express";
import loanctl from "../controllers/emprunts.ts"
import { asyncHandler } from "../asynchandler.ts";
import { Request, Response , NextFunction} from 'express';
import { PrismaClient } from '../generated/prisma';
import {emprunts} from "../generated/prisma"


const client = new PrismaClient();

const loan = Router()

loan.post("/create", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {userId , bookId }: emprunts = req.body
      if (!userId || !bookId) {
         res.status(400).json({ msg: "veuillez remplir tout les champs" })
      } else {
            try {
                const findbook = await client.book.findUnique({
                    where : { bookId }
                })
                if(findbook?.etat !== "disponible"){
                    return res.status(400).json({ msg: "le livre n'est pas disponible pour l'emprunt" })
                }
                else{
                    const emprunts = await client.emprunts.create({
                        data: {
                            userId,
                            bookId,
                            createdAt: new Date(),
                            dateretour: new Date()
                        }
                    })
                    await client.book.update({
                        where: { bookId },
                        data: { 
                            etat : "emprunte" 
                        } // Assuming you have an isAvailable field to mark the book as loaned out
                    })

                    console.log(emprunts)
                    res.status(201).json({
                    msg: "emprunt cree et ajoute avec succes",
                    })

                }
            } catch (error) {
                next(error);
                res.status(500).json({ msg: "Internal server error" })
            }
      }

    },));
loan.get("/:id/return", loanctl.getreturnedloan);
loan.get("/user/:userId", asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "Invalid user ID" });
        }
        try {
            const loans = await client.emprunts.findMany({
                where: { userId },
                include: { book: true } // Include book details in the response
            });
            if (loans.length === 0) {
                return res.status(404).json({ msg: "No loans found for this user" });
            }
            res.status(200).json({msg:`la liste des emprunts de cet utilisateur est : `, loans});
        } catch (error) {
            console.error("Error fetching loans:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }));




export default loan