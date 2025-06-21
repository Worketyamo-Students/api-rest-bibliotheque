import { emprunts } from './../generated/prisma/index.d';

import { Request, Response , NextFunction} from 'express';
import { PrismaClient } from '../generated/prisma';
import {emprunts} from "../generated/prisma"

const client = new PrismaClient();
const loanctl = {
    createloan: async (req: Request, res: Response, next: NextFunction) => {
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
                            updatedAt: new Date()
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

    },
    //retoune un livre emprunte
    getreturnedloan : async (req : Request , res : Response) => {
        const {id} = req.params;
        const findloan = await client.emprunts.findUnique({
            where : {
                id
            }
        })
        if(!findloan){
            res.status(200).json({msg : "loan not found"})
        }
        if(findloan?.updatedAt){
            res.status(200).json({msg : "l'emprunt introuvable"})
  
        }
        await client.emprunts.update({
            where : {
                id 
            },
            data : {
                updatedAt : new Date()
            }
        })
        await client.book.update({
            where : {bookId : findloan?.bookId},
            data : {
                etat : "disponible"
            }
        })

    }
}
export default loanctl; 