
import { Request, Response , NextFunction} from 'express';
import { PrismaClient, User} from '../generated/prisma';
import {emprunts} from "../generated/prisma"
import nodemailer from 'nodemailer';
// import nodemailer from 'nodemailer';

const client = new PrismaClient();
    async function sendMail(usermail: string, titrelivre: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user : process.env.EMAIL_USER, // Assurez-vous de définir ces variables d'environnement
                pass : process.env.EMAIL_PASS, // Assurez-vous de définir ces variables d'environnement
                
            },
        });
    //option de l'email
        const mailoption = {
            from : 'votremail@gmail.com',
            to : usermail,
            subject : 'emprunt de livre',
            text : `le livre  ${titrelivre} que vous avez emprunte est desormais disponible`
        };
        //envoie de l'email
        try {
            const info = await transporter.sendMail(mailoption)
            console.log("email envoye" , info.response)
        }
        catch (error) {
            console.error("Error sending email:", error);
        }
    }

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

    },
    //retoune un livre emprunte
    getreturnedloan : async (req : Request , res : Response) => {
        const {id} = req.params;
        const findloan = await client.emprunts.findUnique({
            where : {
                id : id
            },
            include: { user: true, book: true }
        })
        if(!findloan){
            res.status(404).json({msg : "loan not found"})
        }
        if(findloan?.dateretour){
            res.status(200).json({msg : "le livre a deja ete retourne"})
            await sendMail(findloan.user.email, findloan.book.title);
  
        }
        await client.emprunts.update({
            where : {
                id : id
            },
            data : {
                dateretour : new Date()
            }   
        })
        await client.book.update({
            where : {bookId : findloan?.bookId},
            data : {
                etat : "disponible"
            }
        })

    },
    getloansbyuser : async (req: Request, res: Response) => {
        const { userId } = req.params;
        const {name }:User = req.body
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
            res.status(200).json({msg:`la liste des emprunts de l'utilisateur ${name} est : `, loans});
        } catch (error) {
            console.error("Error fetching loans:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }
}
export default loanctl; 