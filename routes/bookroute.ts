import { Router } from "express";
import bookctl from "../controllers/bookctl.ts"
import { asyncHandler } from "../asynchandler.ts";
import { Request, Response , NextFunction} from 'express';
import { PrismaClient, Book } from '../generated/prisma';
const client = new PrismaClient();
const book = Router()

book.post("/", bookctl.createbook);
book.get("/", bookctl.getAllBooks);
book.put("/:id", asyncHandler(async (req:Request , res : Response , next : NextFunction) =>{
        const {id } = req.params
        const {title , author , description,publishedAt, isbn , etat }: Book = req.body

        if(!id){
            return res.status(400).json({ msg: "Book ID is required" })
        }
        try{
            const book = await client.book.update({
                where : {
                    bookId: id
                },
                data :{
                    title,
                    author,
                    description,
                    publishedAt,
                    isbn,
                    etat
                }
            })
            if(book){
                res.status(200).json({ msg : book})
            }
        }
        catch(error){
            next(error);
            // Log the error for debugging purposes
            console.error("Error updating book:", error)
            res.status(500).json({ msg: "Internal server error" })

        }
    }) );
book.delete("/:id", asyncHandler(async (req:Request , res : Response , next : NextFunction) =>{
        const {id } = req.params

        if(!id ){
            return res.status(400).json({ msg: "Book ID is required" })
        }
        try{
            const book = await client.book.delete({
                where : {
                    bookId : id
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
        
    }));



export default book