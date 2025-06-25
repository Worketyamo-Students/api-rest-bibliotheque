
import { Request, Response , NextFunction} from 'express';
import { PrismaClient } from '../generated/prisma';
import {Book} from "../generated/prisma"
const client = new PrismaClient();

const bookctl = {
    createbook: async (req: Request, res: Response) => {
    const {title , author , description,publishedAt, isbn , etat }: Book = req.body
      if (!title || !author || !description || !publishedAt || !isbn || !etat) {
         res.status(400).json({ msg: "veuillez remplir tout les champs" })
      } else {
         try {
            const book = await client.book.create({
            data: {
                title,
                author,
                description,
                publishedAt,
                isbn,
                etat
            }
         })

            console.log(book)
            res.status(201).json({
               msg: "livre cree et ajoute avec succes a la bibliotheque",
            })
         } catch (error) {
            console.error("Error creating teacher:", error)
            res.status(500).json({ msg: "Internal server error" })
         }
      }

    },
    getAllBooks: async (req: Request, res: Response) => {
        try{
            
            const books = await client.book.findMany()
            if(books.length === 0){
                res.status(404).json({ msg: "Aucun livre trouve dans la bibliotheque" })
            }
            else{
                res.status(200).json(books)
                console.log(req)
            }
        }
        catch(error){
            console.error("Error fetching books:", error)
            res.status(500).json({ msg: "Internal server error" })
        }
    },
    getBookById : async (req:Request , res : Response) =>{
        const {bookId } = req.params
        if(!bookId){
            return res.status(400).json({ msg: "Book ID is required" })
        }
        try{
            const book = await client.book.findUnique({
                where : {
                    bookId
                }
            })
            if(book){
                res.status(200).json({ msg : book})
            }
        }
        catch(error){
            console.error("Error fetching books:", error)
            res.status(500).json({ msg: "Internal server error" })

        }
        
    },
        updatebook : async (req:Request , res : Response) =>{
        const {bookId } = req.params
        const {title , author , description,publishedAt, isbn }: Book = req.body

        if(!bookId){
            return res.status(400).json({ msg: "Book ID is required" })
        }
        try{
            const book = await client.book.update({
                where : {
                    bookId
                },
                data :{
                    title,
                    author,
                    description,
                    publishedAt,
                    isbn
                }
            })
            if(book){
                res.status(200).json({ msg : book})
            }
        }
        catch(error){
            console.error("Error fetching books:", error)
            res.status(500).json({ msg: "Internal server error" })

        }
        
    },

        deletebook : async (req:Request , res : Response , next : NextFunction) =>{
        const {bookId } = req.params

        if(!bookId){
            return res.status(400).json({ msg: "Book ID is required" })
        }
        try{
            const book = await client.book.delete({
                where : {
                    bookId
                }
            })
            if(book){
                res.status(200).json({ msg : "le livre a ete supprime avec succes de la bibliotheque"})
            }
            else{
                res.status(404).json({ msg: "Livre non trouve" })
            }
        }
        catch(error){
            next
            console.error("Error fetching books:", error)
            res.status(500).json({ msg: "Internal server error" })

        }
        
    }



}
export default bookctl; 